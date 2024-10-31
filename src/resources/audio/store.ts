import { range } from "lodash";

export type AudioChunk = {
  beatmapId: string;
  chunk: number;
  channels: Float32Array[];
  length: number;
  numberOfChannels: number;
  sampleRate: number;
};

export type AudioReadableStream = ReadableStream<AudioChunk>;

/**
 * @param chunkDuration in seconds
 */
// TODO: handle last chunk when actual size < chunkLength
export const blobToAudioChunks = async (
  audio: Blob,
  chunkDuration = 10,
): Promise<Omit<AudioChunk, "beatmapId">[]> => {
  const audioBuffer = await new AudioContext().decodeAudioData(await audio.arrayBuffer());
  const { length, numberOfChannels, sampleRate } = audioBuffer;

  const numberOfchunks = length / (sampleRate * chunkDuration);
  const chunkLength = sampleRate * chunkDuration;

  const channels: Float32Array[] = [];
  range(numberOfChannels).forEach((channelNumber) => {
    channels[channelNumber] ??= new Float32Array(length);
    audioBuffer.copyFromChannel(channels[channelNumber], channelNumber);
  });

  return range(numberOfchunks).map((chunk_number) => ({
    chunk: chunk_number,
    channels: channels.map((channelData) =>
      channelData.slice(chunk_number * chunkLength, (chunk_number + 1) * chunkLength),
    ),
    length: chunkLength,
    sampleRate,
    numberOfChannels,
  }));
};

export const audioChunkToAudioBuffer = (chunk: AudioChunk): AudioBuffer => {
  const { channels, length, numberOfChannels, sampleRate } = chunk;

  const buffer = new AudioBuffer({ length, numberOfChannels, sampleRate });
  channels.forEach((channel, i) => buffer.copyToChannel(channel, i));

  return buffer;
};

/**
 * @param offset in seconds
 */
export const offsetAudioChunk = (chunk: AudioChunk, offset: number): AudioChunk => {
  const audioFrameOffset = Math.round(offset * chunk.sampleRate);

  return {
    ...chunk,
    channels: chunk.channels.map((channel) => channel.subarray(audioFrameOffset, chunk.length)),
    length: Math.round(chunk.length - audioFrameOffset),
  };
};
