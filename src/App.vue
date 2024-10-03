<script setup lang="ts">
import {
  BlobReader,
  BlobWriter,
  getMimeType,
  TextWriter,
  ZipReader,
} from "@zip.js/zip.js";
import { ref } from "vue";

import FpsCounter from "./components/FpsCounter.vue";
import { Note, NOTE_TYPE } from "./resources/note/store";
import Field from "./resources/field/Field.vue";
import { ColumnProps } from "./resources/column/store";
import { assert } from "./utils/assertions";

const map = ref<{ song?: string; cols: ColumnProps[] }>({
  cols: [
    { hitKey: "a", notes: [] },
    { hitKey: "s", notes: [] },
    { hitKey: "k", notes: [] },
    { hitKey: "l", notes: [] },
  ],
});

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  const reader = new ZipReader(new BlobReader(files.item(0)!));
  const entries = await reader.getEntries();

  const osu_file = entries.find((e) => e.filename.endsWith(".osu"));
  if (!osu_file || !osu_file.getData) return;

  const text = await osu_file.getData(new TextWriter());
  // AUDIO
  const audioFilename = new RegExp(
    /^AudioFilename: (?<audioFile>.*)$/,
    "gm",
  ).exec(text)?.groups?.audioFile;
  assert(audioFilename, "AudioFilename not found");
  const audioFile = entries.find((e) => e.filename === audioFilename);
  assert(audioFile?.getData, "non succederà mai XDD");
  const audioBlob = await audioFile?.getData(
    new BlobWriter(getMimeType(audioFilename?.split(".")[1])),
  );
  map.value.song = URL.createObjectURL(audioBlob);

  // NOTES
  const rows = text.match(/^.*$/gm)?.filter((x) => x);
  if (!rows) return;
  const hitObjects = rows.slice(rows.findIndex((v) => v === "[HitObjects]"));
  processHitObjects(hitObjects);
};

const processHitObjects = (rows: string[], n_cols = 4) => {
  rows.forEach((row) => {
    const [x_pos, , hit_t, type, , end_t] = row.split(":")[0].split(",");
    const col_n = getCol(Number(x_pos), n_cols);

    if (isNaN(col_n)) return;

    if (Number(type) === 128) {
      const head: Note = { hit_t: Number(hit_t), type: NOTE_TYPE.HEAD };
      const tail: Note = { hit_t: Number(end_t), type: NOTE_TYPE.TAIL };
      map.value.cols[col_n].notes.push(head, tail);
    } else map.value.cols[col_n].notes.push({ hit_t: Number(hit_t) });
  });
};

const getCol = (x_pos: number, n_cols: number) =>
  Math.floor((x_pos * n_cols) / 512);
</script>

<template>
  <!-- <audio id="audio" :src="audioSrc"></audio> -->
  <div style="display: flex">
    <input type="file" @change="onSelectFile" />
    <field :map />
  </div>
  <fps-counter />
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: rgba(0, 0, 0, 0.85);
}
</style>
