import { AudioReadableStream } from "./store";
import { AudioStream } from "./AudioStream";

export class AudioManager {
  static stream(rs: AudioReadableStream) {
    const audioStream = new AudioStream(rs, new AudioContext());
    return audioStream.stream();
  }
}
