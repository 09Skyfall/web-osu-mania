export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition && import.meta.env.DEV) {
    throw new Error(`Assertion error: ${msg}`);
  }
}
