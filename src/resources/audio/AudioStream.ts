import { assert } from "../../utils/assertions/assert";
import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";
import { AudioGraph } from "./AudioGraph";
import { remove, uniqueId } from "lodash";

export type AudioStreamConstructorOptions = {
  stream?: AudioReadableStream;
  context?: AudioContext;
};

export type SubscriberCallback = (audioPath: AudioGraph) => unknown;

export class AudioStream {
  private _reader: ReadableStreamDefaultReader<AudioChunk> | undefined;
  private _playingGraphs: AudioGraph[] = [];
  private _cancelled = false;
  private _subscribers: { id: string; cb: SubscriberCallback }[] = [];

  public context: AudioContext;

  constructor({ stream, context = new AudioContext() }: AudioStreamConstructorOptions = {}) {
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

    if (done) return;

    this._playChunk(chunk, startTime);
    startTime += chunk.length / chunk.sampleRate;

    while (!this._cancelled) {
      const { done, value: chunk } = await this._reader.read();

      if (done) return;

      const bufferSource = this._playChunk(chunk, startTime);

      await new Promise((res) => bufferSource.addEventListener("ended", res, { once: true }));

      startTime += chunk.length / chunk.sampleRate;
    }
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

  private createAudioGraph(input: AudioBufferSourceNode) {
    return new AudioGraph({ input, output: this.context.destination });
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
