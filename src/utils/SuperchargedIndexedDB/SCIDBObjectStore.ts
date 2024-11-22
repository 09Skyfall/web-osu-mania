import { MaybeArray } from "../../types/MaybeArray";
import { MaybePromise } from "../../types/MaybePromise";
import { toArray } from "../functions/toArray";

export class SCIDBObjectStore<T = unknown> {
  private _database: IDBDatabase;
  private _objectStoreName: string;

  constructor(database: IDBDatabase, objectStoreName: string) {
    this._database = database;
    this._objectStoreName = objectStoreName;
  }

  async get(key: IDBValidKey): Promise<T>;

  async get(key?: undefined): Promise<T[]>;

  async get(key?: IDBValidKey | undefined): Promise<MaybeArray<T>> {
    const request = await this._transaction((objectStore) => {
      let request: IDBRequest<T[]>;
      if (key) {
        request = objectStore.get(key);
      } else {
        request = objectStore.getAll();
      }
      return request;
    });

    return request.result;
  }

  remove() {
    throw new Error("Missing implementation");
  }

  async add(items: MaybeArray<T>, key?: IDBValidKey) {
    const requests = await this._transaction(
      (objectStore) => toArray(items).map((item) => objectStore.add(item, key)),
      "readwrite",
    );

    return requests.map((request) => request.result);
  }

  async count() {
    return this._transaction((objectStore) => objectStore.count());
  }

  async *where(query: IDBKeyRange): AsyncGenerator<T, void, unknown> {
    let finished = false;
    let _query = query;

    while (!finished) {
      const value = await this._transaction((objectStore) => {
        const cursorRequest = objectStore.openCursor(_query);

        return new Promise<T | null>((res) => {
          cursorRequest.addEventListener("success", () => {
            const cursor = cursorRequest.result;

            if (!cursor) {
              finished = true;
            } else {
              _query = IDBKeyRange.bound(cursor.key, query.upper, true); // TODO: all bounds
            }

            res(cursor?.value ?? null);
          });
        });
      });

      if (value === null) return;
      else yield value;
    }
  }

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<T>,
    mode?: IDBTransactionMode,
  ): Promise<T>;

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<T[]>,
    mode?: IDBTransactionMode,
  ): Promise<T[]>;

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<MaybeArray<T>>,
    mode?: IDBTransactionMode,
  ): Promise<MaybeArray<T>> {
    const objectStore = this._database
      .transaction(this._objectStoreName, mode)
      .objectStore(this._objectStoreName);

    const transaction = objectStore.transaction;

    const results = await cb(objectStore);

    return new Promise((res, rej) => {
      transaction.addEventListener("complete", () => res(results), { once: true });

      transaction.addEventListener("error", (e) => rej((e.target as IDBRequest).error), {
        once: true,
      });

      transaction.addEventListener("abort", () => rej(transaction.error), { once: true });
    });
  }
}
