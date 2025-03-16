export enum NOTE_TYPE {
  TAIL = "TAIL",
  HEAD = "HEAD",
}

export type Note = {
  hit_t: number;
  type?: NOTE_TYPE;
};

export type CanvasNoteConstructorOptions = { y: number; type?: NOTE_TYPE; hit_t: number };

export class CanvasNote {
  public y: number = 0;
  public judged = false;
  public readonly type: NOTE_TYPE | undefined = undefined;
  public readonly hit_t: number;

  constructor({ y, type, hit_t }: CanvasNoteConstructorOptions) {
    this.y = y;
    this.type = type;
    this.hit_t = hit_t;
  }
}
