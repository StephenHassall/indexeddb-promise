/**
 * Indexed DB promise index.
 * Wrapper of the IDBIndex IndexedDB API object.
 */
import { Cursor } from "./cursor.js";
import { CursorWithValue } from "./cursor-with-value.js";

export class Index {
    /**
     * Index constructor.
     * @param {IDBIndex} iDbIndex The index interface object.
     */
    constructor(iDbIndex) {
        // Set index interface object
        this._iDbIndex = iDbIndex;
    }

    get keyPath() {
        return this._iDbIndex.keyPath;
    }

    get multiEntry() {
        return this._iDbIndex.multiEntry;
    }

    get name() {
        return this._iDbIndex.name;
    }

    get objectStore() {
        return this._iDbIndex.objectStore;
    }

    get unique() {
        return this._iDbIndex.unique;
    }

    count(key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbIndex.count(key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    get(key) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbIndex.get(key);

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
            const request = this._iDbIndex.getAll(query, count);

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
            const request = this._iDbIndex.getAllKeys(query, count);

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
            const request = this._iDbIndex.getKey(key);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });

        return promise;
    }

    openCursor(query, direction) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbIndex.openCursor(query, direction);

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
            const request = this._iDbIndex.openCursor(query, direction);

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

}