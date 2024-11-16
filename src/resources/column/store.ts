import { inRange } from "lodash";
import { RGB } from "../colors/RGB";
import { assert } from "../../utils/assertions/assert";

export const getColumnColor = (number: number, keyCount: number) => {
  const white = new RGB(255, 255, 255);
  const lightblue = new RGB(144, 213, 255);
  const yellow = new RGB(255, 204, 0);

  switch (keyCount) {
    case 4: {
      assert(inRange(number, 0, 4));
      switch (number) {
        case 0:
        case 3:
          return white;
        case 1:
        case 2:
          return lightblue;
      }

      return white;
    }

    case 7: {
      assert(inRange(number, 0, 7));
      switch (number) {
        case 0:
        case 2:
        case 4:
        case 6:
          return white;
        case 1:
        case 5:
          return lightblue;
        case 3:
          return yellow;
      }

      return white;
    }

    default:
      return white;
  }
};
