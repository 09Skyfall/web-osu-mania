export type FulfilledAndRejected<T> = { fulfilled: T[]; rejected: string[] };

export const fulfilledAndRejected = async <T>(promises: Promise<T>[]) => {
  return (await Promise.allSettled(promises)).reduce<FulfilledAndRejected<T>>(
    (acc, curr) => {
      if (curr.status === "fulfilled") {
        acc.fulfilled.push(curr.value);
      } else {
        acc.rejected.push(curr.reason);
      }
      return acc;
    },
    { fulfilled: [], rejected: [] },
  );
};
