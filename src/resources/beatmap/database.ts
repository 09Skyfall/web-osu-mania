import { MaybeArray } from "../../types/MaybeArray";
import { assert } from "../../utils/assertions";
import { SuperchargedIndexedDB } from "../../utils/SuperchargedIndexedDB/SuperchargedIndexedDB";
import { toArray } from "../../utils/toArray";
import { Beatmap } from "./store";
import { mapAsync } from "../../utils/mapAsync";
import {
  AudioChunk,
  AudioReadableStream,
  blobToAudioChunks,
  offsetAudioChunk,
} from "../audio/store";

const DATABASE_NAME = "Osu!Web-beatmaps-store";
const DATABASE_VERSION = 1;

type BeatmapsDB = {
  beatmaps: Beatmap;
  songs: AudioChunk;
};

class BeatmapsDatabase {
  private db: SuperchargedIndexedDB<BeatmapsDB> | null = null;
  private readonly CHUNK_DURATION = 10; // in seconds

  async open(version = DATABASE_VERSION): Promise<void> {
    this.db = new SuperchargedIndexedDB<BeatmapsDB>();
    const sciDBVersion = this.db.open(DATABASE_NAME, version);

    await Promise.all([
      sciDBVersion.createStore({ name: "beatmaps", options: { keyPath: "id" } }),
      sciDBVersion.createStore({
        name: "songs",
        options: { keyPath: ["beatmapId", "chunk"] },
      }),
    ]);
  }

  async addItem(items: MaybeArray<Beatmap>) {
    assert(this.db, "Cannot add item before opening the connection to the databse.");

    const beatmapsChunks = await mapAsync(toArray(items), async (beatmap) => {
      return (await blobToAudioChunks(beatmap.audioSource, this.CHUNK_DURATION)).map((chunk) => ({
        ...chunk,
        beatmapId: beatmap.id,
      }));
    });

    const songsObjectStore = await this.db.objectStore("songs");
    await songsObjectStore.add(beatmapsChunks.flat());

    const beatmapsObjectStore = await this.db.objectStore("beatmaps");
    await beatmapsObjectStore.add(items);
  }

  removeItem() {
    assert(this.db, "Cannot remove item before opening the connection to the databse.");
    throw new Error("Missing implementation");
  }

  async getItem<Store extends keyof BeatmapsDB>(store: Store, key?: IDBValidKey | undefined) {
    assert(this.db, "Cannot get item before opening the connection to the databse.");

    const objectStore = await this.db.objectStore(store);
    return objectStore.get(key);
  }

  /**
   * @param offset in seconds
   */
  async getAudioStream(beatmapId: string, offset = 0): Promise<AudioReadableStream> {
    assert(this.db, "Cannot get audio stream before opening the connection to the databse.");

    const objectStore = await this.db.objectStore("songs");

    const chunkOffset = Math.floor(offset / this.CHUNK_DURATION);
    const offsetWithinChunk = Number((offset % this.CHUNK_DURATION).toFixed(2));

    const chunkGenerator = objectStore.where(
      // https://stackoverflow.com/questions/26203075/querying-an-indexeddb-compound-index-with-a-shorter-array
      IDBKeyRange.bound([beatmapId, chunkOffset], [beatmapId, []]),
    );

    return new ReadableStream<AudioChunk>({
      async start(controller) {
        const { value: chunk, done } = await chunkGenerator.next();

        if (done) {
          controller.close();
          return;
        }

        // TODO: maybe a good idea to merge with the next chunk if the first chunk is offsetted
        controller.enqueue(offsetWithinChunk ? offsetAudioChunk(chunk, offsetWithinChunk) : chunk);
      },

      async pull(controller) {
        const { value: chunk, done } = await chunkGenerator.next();

        if (done) {
          controller.close();
          return;
        }

        controller.enqueue(chunk);
      },
    });
  }
}

const beatmapDb = new BeatmapsDatabase();

export { beatmapDb, BeatmapsDatabase };
