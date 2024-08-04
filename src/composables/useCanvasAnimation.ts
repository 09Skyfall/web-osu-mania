import { ref, type Ref } from "vue";
import { type MaybeArray } from "../types/MaybeArray";
import { assert } from "../utils/assert";
import { toArray } from "../utils/toArray";
import { useAnimate, type UseAnimateOptions } from "./useAnimate";

export type CanvasAnimationFunction = (
  ctx: CanvasRenderingContext2D,
  delta_t: number,
) => void;
type UseCanvasAnimationOptions = {
  animations?: MaybeArray<CanvasAnimationFunction>;
};

export const useCanvasAnimation = (
  canvas: Ref<HTMLCanvasElement | null | undefined>,
  options: UseCanvasAnimationOptions = {},
  useAnimateOptions: UseAnimateOptions = {},
) => {
  const animations = ref([...toArray(options.animations ?? [])]);

  const add = (
    _animations: Required<UseCanvasAnimationOptions>["animations"],
  ) => {
    animations.value.push(...toArray(_animations));
  };

  const { animate } = useAnimate((delta_t: number) => {
    assert(canvas.value);
    const ctx = canvas.value.getContext("2d");
    assert(ctx);

    ctx.reset();
    animations.value.forEach((animation) => animation(ctx, delta_t));
  }, useAnimateOptions);

  return { animate, add };
};
