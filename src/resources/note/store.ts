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
  public judged = false;
  public readonly type: NOTE_TYPE | undefined = undefined;

  constructor({ y, type }: { y: number; type?: NOTE_TYPE }) {
    this.y = y;
    this.type = type;
  }
}
