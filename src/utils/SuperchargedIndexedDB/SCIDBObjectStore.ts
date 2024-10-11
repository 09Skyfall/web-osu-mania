import { MaybeArray } from "../../types/MaybeArray";
import { MaybePromise } from "../../types/MaybePromise";
import { toArray } from "../toArray";

export class SCIDBObjectStore<T = unknown> {
  private _database: IDBDatabase;
  private _objectStoreName: string;

  constructor(database: IDBDatabase, objectStoreName: string) {
    this._database = database;
    this._objectStoreName = objectStoreName;
  }

  get(key: IDBValidKey): Promise<T>;

  get(key?: IDBValidKey): Promise<T[]>;

  get(key?: IDBValidKey): Promise<MaybeArray<T>> {
    return this._transaction((objectStore) => {
      let request: IDBRequest<T[]>;
      if (key) {
        request = objectStore.get(key);
      } else {
        request = objectStore.getAll();
      }
      return request;
    });
  }

  remove() {
    throw new Error("Missing implementation");
  }

  add(items: MaybeArray<T>, key?: IDBValidKey) {
    return this._transaction(
      (objectStore) => toArray(items).map((item) => objectStore.add(item, key)),
      "readwrite",
    );
  }

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<IDBRequest<T>>,
    mode?: IDBTransactionMode,
  ): Promise<T>;

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<IDBRequest<T>[]>,
    mode?: IDBTransactionMode,
  ): Promise<T[]>;

  private async _transaction<T>(
    cb: (store: IDBObjectStore) => MaybePromise<MaybeArray<IDBRequest<T>>>,
    mode?: IDBTransactionMode,
  ): Promise<MaybeArray<T>> {
    const objectStore = this._database
      .transaction(this._objectStoreName, mode)
      .objectStore(this._objectStoreName);

    const transaction = objectStore.transaction;

    const requests = await cb(objectStore);

    return new Promise((res, rej) => {
      transaction.addEventListener(
        "complete",
        () => res(Array.isArray(requests) ? requests.map((r) => r.result) : requests.result),
        { once: true },
      );
      transaction.addEventListener("error", (e) => rej((e.target as IDBRequest).error), {
        once: true,
      });
      transaction.addEventListener("abort", () => rej(transaction.error), { once: true });
    });
  }
}
