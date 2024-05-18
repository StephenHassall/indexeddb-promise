/**
 * Indexed DB promise cursor.
 * Wrapper of the IDBCursor IndexedDB API object.
 */

export class Cursor {
    /**
     * Cursor constructor.
     * @param {IDBCursor} iDbCursor The cursor interface object.
     * @param {IDBRequest} iDbRequest The request interface object used to open the cursor with.
     */
    constructor(iDbCursor, iDbRequest) {
        // Set cursor interface object
        this._iDbCursor = iDbCursor;

        // Set request object
        this._iDbRequest = iDbRequest;
    }

    /**
     * Gets the direction value that was used when creating the cursor object.
     * @return {String} Either "next", "nextunique", "prev" pr "prevunique".
     */
    get direction() {
        // Return the direction value
        return this._iDbCursor.direction;
    }

    /**
     * Gets the key of the current record/object in the cursor.
     * @return {*} The current record's key.
     */
    get key() {
        // Get the current record's key value
        return this._iDbCursor.key;
    }

    /**
     * Gets the primary key of the current record/object in the cursor, instead of the
     * key used to find the object.
     */
    get primaryKey() {
        // Get the current record's primary key value
        return this._iDbCursor.primaryKey;
    }

    /**
     * Gets the request the cursor is linked to.
     * @return {IDBRequest} The request interface object.
     */
    get request() {
        // Return the request interface object
        return this._iDbCursor.request;
    }

    /**
     * Gets the source of the cursor. This is either the IDBObjectStore or IDBIndex object.
     * @return {IDBObjectStore|IDBIndex} The source of the cursor.
     */
    get source() {
        // Return the source interface object
        return this._iDbCursor.source;
    }

    /**
     * Moves the cursor on by the given number of steps. The Cursor.continue function moves the cursor
     * by 1 step, but here you can advance a number of steps in one go.
     * @param {Number} count The number of records to advance by.
     * @return {Promise} A promise.
     */
    advance(count) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Handle on error event
            this._iDbRequest.onerror = () => {
                // Reject the promise with the error
                reject(this._iDbRequest.error);
            };

            // Handle on success event
            this._iDbRequest.onsuccess = () => {
                // Resolve the promise
                resolve();
            };

            // Advance the cursor
            this._iDbCursor.advance(count);
        });

        // Return the promise
        return promise;
    }

    /**
     * Continue on to the next record/object.
     * @param {*} [key] The key use to find the next record.
     * @return {Promise} A promise.
     */
    continue(key) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Handle on error event
            this._iDbRequest.onerror = () => {
                // Reject the promise with the error
                reject(this._iDbRequest.error);
            };

            // Handle on success event
            this._iDbRequest.onsuccess = () => {
                // Resolve the promise
                resolve();
            };

            // Continue on to the next record in cursor
            this._iDbCursor.continue(key);
        });

        // Return the promise
        return promise;
    }

    /**
     * Continue on to the next record/object using the primary key.
     * @param {*} key The key to look with.
     * @param {*} primaryKey The primary key to look with.
     * @return {Promise} A promise.
     */
    continuePrimaryKey(key, primaryKey) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Handle on error event
            this._iDbRequest.onerror = () => {
                // Reject the promise with the error
                reject(this._iDbRequest.error);
            };

            // Handle on success event
            this._iDbRequest.onsuccess = () => {
                // Resolve the promise
                resolve();
            };

            // Continue on to the next record in cursor using the primary key
            this._iDbCursor.continuePrimaryKey(key, primaryKey);
        });

        // Return the promise
        return promise;
    }
}