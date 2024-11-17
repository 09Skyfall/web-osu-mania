import { assert } from "../../utils/assertions/assert";
import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";
import { AudioGraph, AudioGraphNode } from "./AudioGraph";
import { remove, uniqueId } from "lodash";
import { AudioGraphUtils } from "./AudioGraphUtils";

export type AudioStreamConstructorOptions = {
  stream?: AudioReadableStream;
  context?: AudioContext;
};

export type SubscriberCallback = (audioPath: AudioGraph) => unknown;

export class AudioStream extends EventTarget {
  private _reader: ReadableStreamDefaultReader<AudioChunk> | undefined;
  private _cancelled = false;
  private _volume = 1;
  private _playingGraphs: AudioGraph[] = [];
  private _playingGains: GainNode[] = [];
  private _subscribers: { id: string; cb: SubscriberCallback }[] = [];

  public context: AudioContext;

  constructor({ stream, context = new AudioContext() }: AudioStreamConstructorOptions = {}) {
    super();
    this._reader = stream?.getReader();
    this.context = context;
  }

  setReader(rs: AudioReadableStream) {
    assert(this._reader === undefined, "Only one readableStream can be set.");

    this._reader = rs.getReader();
  }

  hasReader() {
    return Boolean(this._reader);
  }

  async stream() {
    assert(this._reader, "No readableStream was set for this AudioStream.");

    let startTime = 0;

    const { done, value: chunk } = await this._reader.read();

    if (done) {
      this.dispatchEvent(new CustomEvent("end"));
      return;
    }

    this._playChunk(chunk, startTime);
    startTime += chunk.length / chunk.sampleRate;

    while (!this._cancelled) {
      const { done, value: chunk } = await this._reader.read();

      if (done) {
        this.dispatchEvent(new CustomEvent("end"));
        return;
      }

      const bufferSource = this._playChunk(chunk, startTime);

      await new Promise((res) => bufferSource.addEventListener("ended", res, { once: true }));

      startTime += chunk.length / chunk.sampleRate;
    }

    this.dispatchEvent(new CustomEvent("cancelled"));
  }

  pause() {
    assert(this._reader, "No readableStream was set for this AudioStream.");

    return this.context.suspend();
  }

  resume() {
    assert(this._reader, "No readableStream was set for this AudioStream.");

    return this.context.resume();
  }

  stop() {
    assert(this._reader, "No readableStream was set for this AudioStream.");

    this._cancelled = true;

    this._playingGraphs.forEach((p) => p.input.node.stop());

    return this._reader.cancel();
  }

  subscribe(cb: SubscriberCallback) {
    const id = uniqueId("audio-stream-subscriber");

    this._subscribers.push({ cb, id });

    this._playingGraphs.forEach((graph) => cb(graph));

    return id;
  }

  unsubscribe(id: string) {
    const [removed] = remove(this._subscribers, (subscriber) => subscriber.id === id);
    assert(Boolean(removed));
  }

  get currentGraphs() {
    return this._playingGraphs;
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
    this._playingGains.forEach((gainNode) => (gainNode.gain.value = value));
  }

  private createAudioGraph(input: AudioBufferSourceNode) {
    const ag = new AudioGraph({ input, output: this.context.destination });

    const gainNode = this.context.createGain();
    gainNode.gain.value = this.volume;
    AudioGraphUtils.insertNodeBetween(new AudioGraphNode(gainNode), ag.input, ag.output);

    if (this._playingGains.length >= 2) this._playingGains.shift();
    this._playingGains.push(gainNode);

    return ag;
  }

  private _playChunk = (chunk: AudioChunk, startTime: number) => {
    const bufferSource = this.context.createBufferSource();

    bufferSource.buffer = audioChunkToAudioBuffer(chunk);

    bufferSource.start(startTime);

    if (this._playingGraphs.length >= 2) this._playingGraphs.shift();
    const audioGraph = this.createAudioGraph(bufferSource);
    this._playingGraphs.push(audioGraph);

    this._subscribers.forEach(({ cb }) => cb(audioGraph));

    return bufferSource;
  };
}
