export const mapAsync = async <T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> => {
  return Promise.all(array.map(callbackfn));
};
