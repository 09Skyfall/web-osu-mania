import { uniqueId } from "lodash";

export enum NOTE_TYPE {
  TAIL = "TAIL",
  HEAD = "HEAD",
}

export type Note = {
  hit_t: number;
  type?: NOTE_TYPE;
};

export class CanvasNote {
  public y: number = 0;
  public readonly type: NOTE_TYPE | undefined = undefined;
  public readonly id = uniqueId();

  constructor({ y, type }: { y: number; type?: NOTE_TYPE }) {
    this.y = y;
    this.type = type;
  }
}
