import { MaybeArray } from "../../types/MaybeArray";
import { assert } from "../../utils/assertions/assert";
import { toArray } from "../../utils/functions/toArray";
import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";

export type AudioStreamConstructorOptions = {
  stream?: AudioReadableStream;
  context?: AudioContext;
};

export type SubscriberCallback = (buffer: AudioBufferSourceNode) => unknown;

export class AudioStream {
  private _reader: ReadableStreamDefaultReader<AudioChunk> | undefined;
  private _playingBuffers: AudioBufferSourceNode[] = [];
  private _cancelled = false;
  private _subscribers: SubscriberCallback[] = [];

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

    this._playingBuffers.push(this._playChunk(chunk, startTime));
    startTime += chunk.length / chunk.sampleRate;

    while (!this._cancelled) {
      const { done, value: chunk } = await this._reader.read();

      if (done) return;

      const bufferSource = this._playChunk(chunk, startTime);
      this._playingBuffers.push(bufferSource);

      await new Promise((res) => bufferSource.addEventListener("ended", res, { once: true }));
      this._playingBuffers.shift();
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

    this._playingBuffers.forEach((b) => {
      b.disconnect();
      b.stop();
    });

    return this._reader.cancel();
  }

  subscribe(cb: MaybeArray<SubscriberCallback>) {
    this._subscribers.push(...toArray(cb));
  }

  private _playChunk = (chunk: AudioChunk, startTime: number) => {
    const bufferSource = this.context.createBufferSource();

    bufferSource.buffer = audioChunkToAudioBuffer(chunk);

    this._subscribers.forEach((cb) => cb(bufferSource));

    bufferSource.connect(this.context.destination);
    bufferSource.start(startTime);

    return bufferSource;
  };
}
