import { assert } from "../../utils/assertions";
import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";

export type AudioStreamConstructorOptions = {
  stream?: AudioReadableStream;
  context?: AudioContext;
};
export class AudioStream {
  private _reader: ReadableStreamDefaultReader<AudioChunk> | undefined;
  private _context: AudioContext;
  private _playingBuffers: AudioBufferSourceNode[] = [];
  private _cancelled = false;

  constructor({ stream, context = new AudioContext() }: AudioStreamConstructorOptions = {}) {
    this._reader = stream?.getReader();
    this._context = context;
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

    return this._context.suspend();
  }

  resume() {
    assert(this._reader, "No readableStream was set for this AudioStream.");

    return this._context.resume();
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

  private _playChunk = (chunk: AudioChunk, startTime: number) => {
    const bufferSource = this._context.createBufferSource();

    bufferSource.buffer = audioChunkToAudioBuffer(chunk);
    bufferSource.connect(this._context.destination);
    bufferSource.start(startTime);

    return bufferSource;
  };
}
