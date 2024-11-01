import { assert } from "./assert";

export function nonNull<T>(value: T | null | undefined): NonNullable<T> {
  assert(value);
  return value;
}
