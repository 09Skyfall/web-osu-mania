import { SETTINGS, settingsMeta } from "../settings/vos";
import { AudioStream } from "./AudioStream";

class AudioManager {
  private _streams: AudioStream[] = [];
  private _volume: number;

  constructor() {
    const defaultVolume = JSON.stringify(settingsMeta[SETTINGS.MASTER_VOLUME].default);

    this._volume = JSON.parse(localStorage.getItem(SETTINGS.MASTER_VOLUME) ?? defaultVolume) / 100;
  }

  createStream(...args: ConstructorParameters<typeof AudioStream>) {
    const stream = new AudioStream(...args);
    stream.volume = this._volume;

    const i = this._streams.push(stream);

    stream.subscribe("cancelled", () => this._streams.slice(i, 1), { once: true });
    stream.subscribe("end", () => this._streams.slice(i, 1), { once: true });

    return stream;
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
    this._streams.forEach((s) => (s.volume = this._volume));
  }
}

export const audioManager = new AudioManager();
