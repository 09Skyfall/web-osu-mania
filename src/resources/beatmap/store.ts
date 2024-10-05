import {
  BlobReader,
  BlobWriter,
  Entry,
  TextWriter,
  ZipReader,
} from "@zip.js/zip.js";
import { assert, nonNull } from "../../utils/assertions";
import { Note, NOTE_TYPE } from "../note/store";
import { curry, identity, range } from "lodash";
import { mapAsync } from "../../utils/mapAsync";

export type Beatmap = {
  id: string;
  levels: BeatmapLevel[];
};

export type BeatmapLevel = {
  title: string;
  artist: string;
  OverallDifficulty: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  hitObjects: Note[][];
  keysCount: number;
  audio: {
    source: string;
    delay: number;
    previewTime: number;
  };
  imageSource?: string;
};

enum PROPERTY {
  AUDIO_FILENAME = "AudioFilename",
  AUDIO_LEAD_IN = "AudioLeadIn",
  PREVIEW_TIME = "PreviewTime",
  TITLE = "Title",
  ARTIST = "Artist",
  BEATMAP_SET_ID = "BeatmapSetID",
  OVERALL_DIFFICULTY = "OverallDifficulty",
  CIRCLE_SIZE = "CircleSize", // Corresponds to column count in osu!mania
  IMAGE_FILENAME = "ImageFilename",
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
    [PROPERTY.TITLE, PROPERTY.ARTIST, PROPERTY.BEATMAP_SET_ID],
  ],
  [
    PROPERTY_CATEGORY.DIFFICULTY,
    [PROPERTY.OVERALL_DIFFICULTY, PROPERTY.CIRCLE_SIZE],
  ],
  [PROPERTY_CATEGORY.EVENTS, [PROPERTY.IMAGE_FILENAME]],
]);

export const oszToJson = async (file: File): Promise<Beatmap> => {
  assert(file.name.endsWith(".osz"), "Expected .osz file");

  const reader = new ZipReader(new BlobReader(file));
  const entries = await reader.getEntries();

  let beatmapId: null | string = null;

  const beatmapLevels = await mapAsync<Entry, BeatmapLevel>(
    entries.filter((e) => e.filename.endsWith(".osu")),
    async (osuFile) => {
      assert(osuFile.getData);
      const textContent = await osuFile.getData(new TextWriter());

      const valueOf = (property: PROPERTY) => {
        return findPropertyValue(textContent, property);
      };

      beatmapId = nonNull(valueOf(PROPERTY.BEATMAP_SET_ID));

      const keysCount = Number(nonNull(valueOf(PROPERTY.CIRCLE_SIZE)));
      const c_getMediaUrl = curry(getMediaAsBlobUrl)(entries)(textContent);

      return {
        title: nonNull(valueOf(PROPERTY.TITLE)),
        artist: nonNull(valueOf(PROPERTY.ARTIST)),
        OverallDifficulty: Number(
          nonNull(valueOf(PROPERTY.OVERALL_DIFFICULTY)),
        ) as BeatmapLevel["OverallDifficulty"],
        hitObjects: extractHitObjects(textContent, keysCount),
        keysCount,
        audio: {
          source: nonNull(await c_getMediaUrl(PROPERTY.AUDIO_FILENAME)),
          delay: Number(nonNull(valueOf(PROPERTY.AUDIO_LEAD_IN))),
          previewTime: Number(nonNull(valueOf(PROPERTY.PREVIEW_TIME))),
        },
        imageSource: await c_getMediaUrl(PROPERTY.IMAGE_FILENAME),
      } satisfies BeatmapLevel;
    },
  );

  return { id: nonNull(beatmapId), levels: beatmapLevels };
};

const getMediaAsBlobUrl = async (
  entries: Entry[],
  textContent: string,
  property: PROPERTY.IMAGE_FILENAME | PROPERTY.AUDIO_FILENAME,
) => {
  const media = entries.find(
    (e) => e.filename === findPropertyValue(textContent, property),
  );
  if (!media) return undefined;

  assert(media.getData);
  return URL.createObjectURL(await media.getData(new BlobWriter()));
};

// TODO: clean
const extractHitObjects = (textContent: string, keysCount: number) => {
  const hitObjectsRaw = findCategoryValue(
    textContent,
    PROPERTY_CATEGORY.HIT_OBJECTS,
  )
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

const getCol = (x_pos: number, n_cols: number) =>
  Math.floor((x_pos * n_cols) / 512);

const findPropertyValue = (textContent: string, property: PROPERTY) => {
  const category = [...beatmapLevelProperties.keys()].find((k) =>
    beatmapLevelProperties.get(k)?.includes(property),
  );

  assert(category, `Category not found for property ${property}`);

  switch (category) {
    case PROPERTY_CATEGORY.GENERAL:
    case PROPERTY_CATEGORY.EDITOR:
      return new RegExp(`^${property}: (?<value>.*)$`, "gm").exec(textContent)
        ?.groups?.value;

    case PROPERTY_CATEGORY.METADATA:
    case PROPERTY_CATEGORY.DIFFICULTY:
      return new RegExp(`^${property}:(?<value>.*)$`, "gm").exec(textContent)
        ?.groups?.value;

    case PROPERTY_CATEGORY.EVENTS: {
      const categoryValue = findCategoryValue(textContent, category);
      if (!categoryValue) return;

      if (property === PROPERTY.IMAGE_FILENAME)
        return new RegExp(
          /^\/\/Background and Video events\r\n(?=.*"(?<image>.*)")/,
          "gm",
        ).exec(categoryValue)?.groups?.image;

      return undefined;
    }
    default:
      return undefined;
  }
};

const findCategoryValue = (
  textContent: string,
  category: PROPERTY_CATEGORY,
) => {
  return new RegExp(`^\\[${category}\\](?<value>(\r\n.+)+)`, "gm").exec(
    textContent,
  )?.groups?.value;
};
