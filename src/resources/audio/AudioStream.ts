import { AudioReadableStream, AudioChunk, audioChunkToAudioBuffer } from "./store";

export class AudioStream {
  private _readableStream: AudioReadableStream;
  private _context: AudioContext;
  private _playingBuffers: AudioBufferSourceNode[] = [];
  private _streaming = false;
  private _cancelled = false;

  constructor(rs: AudioReadableStream, context: AudioContext) {
    this._readableStream = rs;
    this._context = context;
  }

  stream() {
    this._streaming = true;

    const reader = this._readableStream.getReader();

    this._startStream(reader);

    return async () => {
      this._streaming = false;
      this._cancelled = true;

      this._playingBuffers.forEach((b) => {
        b.disconnect();
        b.stop();
      });

      await reader.cancel();
    };
  }

  isStreaming() {
    return this._streaming;
  }

  private async _startStream(reader: ReadableStreamDefaultReader<AudioChunk>) {
    let startTime = 0;

    const { done, value: chunk } = await reader.read();

    if (done) return;

    this._playingBuffers.push(this._playChunk(chunk, startTime));
    startTime += chunk.length / chunk.sampleRate;

    while (!this._cancelled) {
      const { done, value: chunk } = await reader.read();

      if (done) return;

      const bufferSource = this._playChunk(chunk, startTime);
      this._playingBuffers.push(bufferSource);

      await new Promise((res) => bufferSource.addEventListener("ended", res, { once: true }));
      this._playingBuffers.shift();
      startTime += chunk.length / chunk.sampleRate;
    }
  }

  private _playChunk = (chunk: AudioChunk, startTime: number) => {
    const bufferSource = this._context.createBufferSource();

    bufferSource.buffer = audioChunkToAudioBuffer(chunk);
    bufferSource.connect(this._context.destination);
    bufferSource.start(startTime);

    return bufferSource;
  };
}
