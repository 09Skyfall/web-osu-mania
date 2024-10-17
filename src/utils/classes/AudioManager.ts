import { audioChunkToAudioBuffer, AudioStream } from "../../resources/audio/store";

export class AudioManager {
  static context = new AudioContext();

  static async stream(rs: AudioStream) {
    // TOOD: if already streaming throw

    const reader = rs.getReader();
    const destination = this.context.createGain();
    destination.connect(this.context.destination);

    let startTime = 0;

    // TODO: clean this shit
    const { done, value } = await reader.read();
    if (done) return;
    const bufferSource = this.context.createBufferSource();
    bufferSource.buffer = audioChunkToAudioBuffer(value);
    bufferSource.connect(destination);
    bufferSource.start(startTime);

    while (true) {
      try {
        const { done, value } = await reader.read();

        if (done) return;

        startTime += value.length / value.sampleRate;

        const bufferSource = this.context.createBufferSource();
        bufferSource.buffer = audioChunkToAudioBuffer(value);
        bufferSource.connect(destination);
        console.log(this.context.currentTime, startTime);
        bufferSource.start(startTime);

        await new Promise((res) => bufferSource.addEventListener("ended", res, { once: true }));
      } catch (e) {
        console.log(e);
      }
    }
  }
}
