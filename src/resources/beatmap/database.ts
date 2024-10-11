import { MaybeArray } from "../../types/MaybeArray";
import { assert } from "../../utils/assertions";
import { SuperchargedIndexedDB } from "../../utils/SuperchargedIndexedDB/SuperchargedIndexedDB";
import { Beatmap } from "./store";

const DATABASE_NAME = "Osu!Web-beatmaps-store";
const DATABASE_VERSION = 1;

type BeatmapsDB = { beatmaps: Beatmap };

class BeatmapsDatabase {
  private db: SuperchargedIndexedDB<BeatmapsDB> | null = null;

  async open(version = DATABASE_VERSION): Promise<void> {
    this.db = new SuperchargedIndexedDB<BeatmapsDB>();
    const sciDBVersion = this.db.open(DATABASE_NAME, version);

    await sciDBVersion.createStore({ name: "beatmaps", options: { keyPath: "id" } });
  }

  async addItem(items: MaybeArray<Beatmap>) {
    assert(this.db, "Cannot add item before opening the connection to the databse.");

    const objectStore = await this.db.objectStore("beatmaps");
    return objectStore.add(items);
  }

  removeItem() {
    assert(this.db, "Cannot remove item before opening the connection to the databse.");
    throw new Error("Missing implementation");
  }

  async getItem(key?: IDBValidKey) {
    assert(this.db, "Cannot get item before opening the connection to the databse.");

    const objectStore = await this.db.objectStore("beatmaps");
    return objectStore.get(key);
  }
}

const beatmapDb = new BeatmapsDatabase();

export { beatmapDb, BeatmapsDatabase };
