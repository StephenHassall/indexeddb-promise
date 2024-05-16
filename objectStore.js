/**
 * Indexed DB promise object store.
 * Wrapper of the IDBObjectStore IndexedDB API object.
 */
import { Cursor } from "./cursor.js";
import { CursorWithValue } from "./cursor-with-value.js";
import { Index } from "./index.js";

export class ObjectStore {
    /**
     * Object store constructor.
     * @param {IDBObjectStore} iDbObjectStore The object store interface object.
     */
    constructor(iDbObjectStore) {
        // Set object store interface object
        this._iDbObjectStore = iDbObjectStore;
    }

    get autoIncrement() {
        return this._iDbObjectStore.autoIncrement;
    }

    get indexNames() {
        return this._iDbObjectStore.indexNames;
    }

    get keyPath() {
        return this._iDbObjectStore.keyPath;
    }

    get name() {
        return this._iDbObjectStore.name;
    }

    get transaction() {
        return this._iDbObjectStore.transaction;
    }

    add(value, key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.add(value, key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    clear() {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.clear();

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve();
            };
        });

        return promise;
    }

    count(query) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.count(query);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    createIndex(indexName, keyPath, options) {
        return this._iDbObjectStore.createIndex(indexName, keyPath, options);
    }

    delete(key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.delete(key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve();
            };
        });

        return promise;
    }

    deleteIndex(indexName) {
        this._iDbObjectStore.deleteIndex(indexName);
    }

    get(key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.get(key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    getAll(query, count) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.getAll(query, count);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    getAllKeys(query, count) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.getAllKeys(query, count);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    getKey(key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.getKey(key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    index(name) {
        // Get index interface object
        const iDbIndex = this._iDbObjectStore.index(name);

        // Create and return an Index object
        return new Index(iDbIndex);
    }

    openCursor(query, direction) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.openCursor(query, direction);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                if (request.result === null) { resolve(); return; }
                const cursorWithValue = new CursorWithValue(request.result);
                resolve(cursorWithValue);
            };
        });

        return promise;
    }

    openKeyCursor(query, direction) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.openCursor(query, direction);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                if (request.result === null) { resolve(); return; }
                const cursor = new Cursor(request.result);
                resolve(cursor);
            };
        });

        return promise;
    }

    put(value, key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbObjectStore.put(value, key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

}