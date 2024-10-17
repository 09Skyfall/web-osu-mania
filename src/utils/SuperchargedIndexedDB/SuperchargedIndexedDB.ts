import { SCIDBObjectStore } from "./SCIDBObjectStore";
import { SCIDBVersion } from "./SCIDBVersion";

export class SuperchargedIndexedDB<T extends SCIDBObjectStores = Record<string, unknown>> {
  database: Promise<IDBDatabase> = new Promise(() => {});

  open(...args: Parameters<typeof indexedDB.open>): SCIDBVersion<T> {
    const request = indexedDB.open(...args);

    const scidbVersion = new SCIDBVersion<T>(request);
    this.database = scidbVersion.database;

    return scidbVersion;
  }

  async objectStore<Store extends keyof T & string>(store: Store) {
    return new SCIDBObjectStore<T[Store]>(await this.database, store);
  }
}

export type SCIDBObjectStores = { [objectStore: string]: unknown };
