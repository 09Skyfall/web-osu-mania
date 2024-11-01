import { MaybeArray } from "../../types/MaybeArray";

export const toArray = <T>(v: MaybeArray<T>): T[] => (Array.isArray(v) ? v : [v]);
