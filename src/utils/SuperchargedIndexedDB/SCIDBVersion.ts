import { MaybeArray } from "../../types/MaybeArray";
import { toArray } from "../functions/toArray";
import { SCIDBObjectStores } from "./SuperchargedIndexedDB";

export class SCIDBVersion<T extends SCIDBObjectStores = Record<string, unknown>> {
  private _request: IDBOpenDBRequest;

  public database: Promise<IDBDatabase> = new Promise(() => {});

  constructor(request: IDBOpenDBRequest) {
    this._request = request;

    this.database = new Promise((res, rej) => {
      request.addEventListener("success", () => res(request.result), { once: true });
      request.addEventListener("error", () => rej(request.error), { once: true });
    });
  }

  async createStore({ name, options, indexes }: CreateStoreOptions<T>): Promise<void> {
    return new Promise((res, rej) => {
      this._request.addEventListener(
        "upgradeneeded",
        async (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          const objectStore = db.createObjectStore(name, options);

          toArray(indexes ?? []).forEach((index) => {
            if (typeof index === "string") {
              objectStore.createIndex(index, index);
            } else {
              const { name, keyPath, options } = index;
              objectStore.createIndex(name, keyPath, options);
            }
          });

          objectStore.transaction.addEventListener("complete", () => res(), { once: true });
          objectStore.transaction.addEventListener("error", rej, { once: true });
          objectStore.transaction.addEventListener("abort", rej, { once: true });
        },
        { once: true },
      );

      this._request.addEventListener("success", () => res(), { once: true });
    });
  }
}

type CreateStoreOptions<T extends SCIDBObjectStores> = {
  name: keyof T & string;
  options?: IDBObjectStoreParameters;
  indexes?: MaybeArray<
    string | { name: string; keyPath: string | Iterable<string>; options?: IDBIndexParameters }
  >;
};
