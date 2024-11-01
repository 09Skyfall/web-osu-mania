import { inRange } from "lodash";
import { assert } from "../assertions/assert";

export class RGB {
  r: number = 0;
  g: number = 0;
  b: number = 0;

  constructor(r: number, g: number, b: number) {
    assert(inRange(r, 0, 255 + 1), "RGB values need to be between 0 and 255");
    assert(inRange(g, 0, 255 + 1), "RGB values need to be between 0 and 255");
    assert(inRange(b, 0, 255 + 1), "RGB values need to be between 0 and 255");

    this.r = r;
    this.g = g;
    this.b = b;
  }

  static interpolate(x: RGB, y: RGB, factor: number) {
    const interpolateValue = (a: number, b: number, factor: number) =>
      a * (1 - factor) + b * factor;

    return new RGB(
      interpolateValue(x.r, y.r, factor),
      interpolateValue(x.g, y.g, factor),
      interpolateValue(x.b, y.b, factor),
    );
  }

  toString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
