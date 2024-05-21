/**
 * Indexed DB promise cursor with value.
 * Wrapper of the IDBCursorWithValue IndexedDB API object.
 */
import { Cursor } from "./cursor.js";

export class CursorWithValue extends Cursor {
    /**
     * Cursor with value constructor.
     * @param {IDBCursorWithValue} iDbCursorWithValue The cursor with value interface object.
     * @param {IDBRequest} iDbRequest The request interface object used to open the cursor with.
     */
    constructor(iDbCursorWithValue, iDbRequest) {
        // Call super
        super(iDbCursorWithValue, iDbRequest);

        // Set cursor with value interface object
        this._iDbCursorWithValue = iDbCursorWithValue;
    }

    /**
     * Get the cursor's current object value.
     * @return {*} The current object value.
     */
    get value() {
        // Return the value
        return this._iDbCursorWithValue.value;
    }

    /**
     * Delete the cursor's current record/object.
     * 
     * **WARNING:** Must be used with `async/await`.
     * @return {Promise} A promise.
     */
    delete() {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Delete the current record/object
            const request = this._iDbCursorWithValue.delete();

            // Handle the on error event
            request.onerror = () => {
                // Reject the promise with the error
                reject(request.error);
            };

            // Handle on success event
            request.onsuccess = () => {
                // Resolve the promise
                resolve();
            };
        });

        // Return the promise
        return promise;
    }

    /**
     * Update the cursor's current record/object with the new value.
     * 
     * **WARNING:** Must be used with `async/await`.
     * @param {*} value The new object to update with.
     * @return {Promise<*>} A promise that resolves with the new key value.
     */
    update(value) {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Update the current record with the new value
            const request = this._iDbCursor.update(value);

            // Handle the on error event
            request.onerror = () => {
                // Reject the promise with the error
                reject(request.error);
            };

            // Handle the on success event
            request.onsuccess = () => {
                // Resolve the promise with the key value
                resolve(request.result);
            };
        });

        // Return the promise
        return promise;
    }
}