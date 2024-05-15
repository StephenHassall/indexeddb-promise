/**
 * Indexed DB promise cursor with value.
 * Wrapper of the IDBCursorWithValue IndexedDB API object.
 */
import { Cursor } from "./cursor.js";

export class CursorWithValue extends Cursor {
    /**
     * Cursor with value constructor.
     * @param {IDBCursorWithValue} iDbCursorWithValue The cursor with value interface object.
     */
    constructor(iDbCursorWithValue) {
        // Call super
        super(iDbCursorWithValue);

        // Set cursor with value interface object
        this._iDbCursorWithValue = iDbCursorWithValue;
    }

    get value() {
        this._iDbCursorWithValue.value;
    }
}