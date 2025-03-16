import { assert } from "../../utils/assertions/assert";
import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";
import { AudioGraph, AudioGraphI, AudioGraphNode } from "./AudioGraph";
import { AudioGraphUtils } from "./AudioGraphUtils";
import { Subscribable } from "../../utils/classes/Subscribable";

export type AudioStreamConstructorOptions = {
  stream?: AudioReadableStream;
  context?: AudioContext;
};

export type AudioStreamEventsDict = {
  "update:graphs": AudioGraphI;
  end: void;
  cancelled: void;
};

type StreamOptions = { startIn?: number };

export class AudioStream extends Subscribable<AudioStreamEventsDict> {
  private _reader: ReadableStreamDefaultReader<AudioChunk> | undefined;
  private _cancelled = false;
  private _volume = 1;
  private _playingGraphs: AudioGraphI[] = [];
  private _playingGains: GainNode[] = [];
  private _playingBuffers: AudioBufferSourceNode[] = [];

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

  async stream({ startIn = 0 }: StreamOptions = {}) {
    assert(this._reader, "No readableStream was set for this AudioStream.");
    const { done, value: chunk } = await this._reader.read();

    if (done) {
      this.publish("end");
      return;
    }

    let startTime = this.context.currentTime + startIn / 1000;

    this._playChunk(chunk, startTime);
    startTime += chunk.length / chunk.sampleRate;

    while (!this._cancelled) {
      const { done, value: chunk } = await this._reader.read();

      if (done) {
        this.publish("end");
        return;
      }

      this._playChunk(chunk, startTime);

      await new Promise((res) =>
        this._playingBuffers[0].addEventListener("ended", res, { once: true }),
      );

      startTime += chunk.length / chunk.sampleRate;
    }

    this.publish("cancelled");
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

    bufferSource.start(startTime);

    bufferSource.buffer = audioChunkToAudioBuffer(chunk);

    if (this._playingGraphs.length >= 2) this._playingGraphs.shift();
    const audioGraph = this.createAudioGraph(bufferSource);
    this._playingGraphs.push(audioGraph);

    if (this._playingBuffers.length >= 2) this._playingBuffers.shift();
    this._playingBuffers.push(bufferSource);

    this.publish("update:graphs", audioGraph);
  };
}
