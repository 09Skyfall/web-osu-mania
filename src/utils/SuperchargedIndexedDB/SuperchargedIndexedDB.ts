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

  async objectStore(name: keyof T & string) {
    return new SCIDBObjectStore<T[typeof name]>(await this.database, name);
  }
}

export type SCIDBObjectStores = { [objectStore: string]: unknown };
