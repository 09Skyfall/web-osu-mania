import { BlobReader, BlobWriter, Entry, TextWriter, ZipReader } from "@zip.js/zip.js";
import { Note, NOTE_TYPE } from "../note/store";
import { curry, identity, range } from "lodash";
import { assert } from "../../utils/assertions/assert";
import { mapAsync } from "../../utils/functions/mapAsync";
import { nonNull } from "../../utils/assertions/nonNull";

export type Beatmap<SourceType extends string | Blob = Blob> = {
  id: string;
  levels: BeatmapLevel[];
  audioSource: SourceType;
  imageSource?: SourceType;
};

export type BeatmapLevel = {
  id: string;
  title: string; // TOOD: hoist
  levelTitle: string; // TODO: rename to "title" after hoisting other properties
  artist: string; // TOOD: hoist
  OverallDifficulty: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  hitObjects: Note[][];
  keyCount: number;
  audioDelay: number;
  audioPreviewTime: number; // TOOD: hoist
};

enum PROPERTY {
  AUDIO_FILENAME = "AudioFilename",
  AUDIO_LEAD_IN = "AudioLeadIn",
  PREVIEW_TIME = "PreviewTime",
  TITLE = "Title",
  ARTIST = "Artist",
  BEATMAP_SET_ID = "BeatmapSetID",
  BEATMAP_LEVEL_ID = "BeatmapID",
  OVERALL_DIFFICULTY = "OverallDifficulty",
  CIRCLE_SIZE = "CircleSize", // Corresponds to column count in osu!mania
  IMAGE_FILENAME = "ImageFilename",
  VERSION = "Version",
}

enum PROPERTY_CATEGORY {
  GENERAL = "General",
  EDITOR = "Editor",
  METADATA = "Metadata",
  DIFFICULTY = "Difficulty",
  EVENTS = "Events",
  TIMING_POINTS = "TimingPoints",
  COLOURS = "Colours",
  HIT_OBJECTS = "HitObjects",
}

const beatmapLevelProperties = new Map([
  [
    PROPERTY_CATEGORY.GENERAL,
    [PROPERTY.AUDIO_FILENAME, PROPERTY.AUDIO_LEAD_IN, PROPERTY.PREVIEW_TIME],
  ],
  [
    PROPERTY_CATEGORY.METADATA,
    [
      PROPERTY.TITLE,
      PROPERTY.ARTIST,
      PROPERTY.VERSION,
      PROPERTY.BEATMAP_SET_ID,
      PROPERTY.BEATMAP_LEVEL_ID,
    ],
  ],
  [PROPERTY_CATEGORY.DIFFICULTY, [PROPERTY.OVERALL_DIFFICULTY, PROPERTY.CIRCLE_SIZE]],
  [PROPERTY_CATEGORY.EVENTS, [PROPERTY.IMAGE_FILENAME]],
]);

export const oszToJson = async (file: Blob): Promise<Beatmap> => {
  // TODO: check that the file given is actually a .osz

  const reader = new ZipReader(new BlobReader(file));
  const entries = await reader.getEntries();

  let beatmapId: null | string = null;
  let imageSource: undefined | Blob = undefined;
  let audioSource: null | Blob = null;

  const beatmapLevels = await mapAsync<Entry, BeatmapLevel>(
    entries.filter((e) => e.filename.endsWith(".osu")),
    async (osuFile) => {
      assert(osuFile.getData);
      const textContent = await osuFile.getData(new TextWriter());

      const valueOf = (property: PROPERTY) => {
        return findPropertyValue(textContent, property);
      };

      const c_getMedia = curry(getMediaAsBlob)(entries)(textContent);

      beatmapId ??= nonNull(valueOf(PROPERTY.BEATMAP_SET_ID));
      audioSource ??= nonNull(await c_getMedia(PROPERTY.AUDIO_FILENAME));
      imageSource ??= await c_getMedia(PROPERTY.IMAGE_FILENAME);

      const keyCount = Number(nonNull(valueOf(PROPERTY.CIRCLE_SIZE)));

      if (![4, 7].includes(keyCount)) {
        throw new Error(`Key count of ${keyCount} is not yet supported.`);
      }

      return {
        id: nonNull(valueOf(PROPERTY.BEATMAP_LEVEL_ID)),
        title: nonNull(valueOf(PROPERTY.TITLE)),
        levelTitle: nonNull(valueOf(PROPERTY.VERSION)),
        artist: nonNull(valueOf(PROPERTY.ARTIST)),
        OverallDifficulty: Number(
          nonNull(valueOf(PROPERTY.OVERALL_DIFFICULTY)),
        ) as BeatmapLevel["OverallDifficulty"],
        hitObjects: extractHitObjects(textContent, keyCount),
        keyCount,
        audioDelay: Number(nonNull(valueOf(PROPERTY.AUDIO_LEAD_IN))),
        audioPreviewTime: Number(nonNull(valueOf(PROPERTY.PREVIEW_TIME))),
      } satisfies BeatmapLevel;
    },
  );

  return {
    id: nonNull(beatmapId),
    audioSource: nonNull(audioSource),
    imageSource,
    levels: beatmapLevels,
  };
};

const getMediaAsBlob = async (
  entries: Entry[],
  textContent: string,
  property: PROPERTY.IMAGE_FILENAME | PROPERTY.AUDIO_FILENAME,
) => {
  const media = entries.find((e) => e.filename === findPropertyValue(textContent, property));
  if (!media) return undefined;

  assert(media.getData);
  return media.getData(new BlobWriter()); // TODO: mimetype??;
};

// TODO: clean
const extractHitObjects = (textContent: string, keysCount: number) => {
  const hitObjectsRaw = findCategoryValue(textContent, PROPERTY_CATEGORY.HIT_OBJECTS)
    ?.match(/^.*$/gm)
    ?.filter(identity);

  assert(hitObjectsRaw);

  return hitObjectsRaw.reduce<Note[][]>(
    (acc, current) => {
      const [x_pos, , hit_t, type, , end_t] = current.split(":")[0].split(",");
      const col_n = getCol(Number(x_pos), keysCount);

      if (isNaN(col_n)) return acc;

      if (Number(type) === 128) {
        const head = { hit_t: Number(hit_t), type: NOTE_TYPE.HEAD };
        const tail = { hit_t: Number(end_t), type: NOTE_TYPE.TAIL };
        acc[col_n].push(head, tail);
      } else acc[col_n].push({ hit_t: Number(hit_t) });

      return acc;
    },
    range(keysCount).map(() => []),
  );
};

const getCol = (x_pos: number, n_cols: number) => Math.floor((x_pos * n_cols) / 512);

const findPropertyValue = (textContent: string, property: PROPERTY) => {
  const category = [...beatmapLevelProperties.keys()].find((k) =>
    beatmapLevelProperties.get(k)?.includes(property),
  );

  assert(category, `Category not found for property ${property}`);

  switch (category) {
    case PROPERTY_CATEGORY.GENERAL:
    case PROPERTY_CATEGORY.EDITOR:
      return new RegExp(`^${property}: (?<value>.*)$`, "gm").exec(textContent)?.groups?.value;

    case PROPERTY_CATEGORY.METADATA:
    case PROPERTY_CATEGORY.DIFFICULTY:
      return new RegExp(`^${property}:(?<value>.*)$`, "gm").exec(textContent)?.groups?.value;

    case PROPERTY_CATEGORY.EVENTS: {
      const categoryValue = findCategoryValue(textContent, category);
      if (!categoryValue) return;

      if (property === PROPERTY.IMAGE_FILENAME)
        return new RegExp(/^\/\/Background and Video events\r\n(?=.*"(?<image>.*)")/, "gm").exec(
          categoryValue,
        )?.groups?.image;

      return undefined;
    }
    default:
      return undefined;
  }
};

const findCategoryValue = (textContent: string, category: PROPERTY_CATEGORY) => {
  return new RegExp(`^\\[${category}\\](?<value>(\r\n.+)+)`, "gm").exec(textContent)?.groups?.value;
};
