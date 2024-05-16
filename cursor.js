/**
 * Indexed DB promise cursor.
 * Wrapper of the IDBCursor IndexedDB API object.
 */

export class Cursor {
    /**
     * Cursor constructor.
     * @param {IDBCursor} iDbCursor The cursor interface object.
     */
    constructor(iDbCursor) {
        // Set cursor interface object
        this._iDbCursor = iDbCursor;
    }

    get direction() {
        return this._iDbCursor.direction;
    }

    get key() {
        return this._iDbCursor.key;
    }

    get primaryKey() {
        return this._iDbCursor.primaryKey;
    }

    get source() {
        return this._iDbCursor.source;
    }

    advance(count) {
        this._iDbCursor.advance(count);
    }

    continue(key) {
        this._iDbCursor.continue(key);
    }

    continuePrimaryKey(key, primaryKey) {
        this._iDbCursor.continuePrimaryKey(key, primaryKey);
    }

    delete() {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbCursor.delete();

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve();
            };
        });

        return promise;
    }

    update(value) {
        const promise = new Promise((resolve, reject) => {
            const request = this._iDbCursor.update(value);

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