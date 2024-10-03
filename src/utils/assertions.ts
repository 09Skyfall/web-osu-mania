export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion error: ${msg}`);
  }
}

export function nonNull<T>(value: T | null | undefined): NonNullable<T> {
  assert(value);
  return value;
}
