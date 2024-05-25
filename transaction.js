/**
 * Indexed DB promise transaction.
 * Wrapper of the IDBTransaction IndexedDB API object.
 */
import { ObjectStore } from "./object-store.js";

export class Transaction {
    /**
     * Transaction constructor.
     * @param {IDBTransaction} iDbTransaction The transaction interface object.
     */
    constructor(iDbTransaction) {
        // Set transaction interface object
        this._iDbTransaction = iDbTransaction;
    }

    /**
     * Get transaction interface object.
     * @return {IDBTransaction} The transaction object.
     */
    get iDbTransaction() {
        // Return the transaction interface object
        return this._iDbTransaction;
    }

    /**
     * Gets the database the transaction is linked to.
     * @return {IDBDatabase} The database interface object.
     */
    get db() {
        // Return the database interface object
        return this._iDbTransaction.db;
    }

    /**
     * Gets the durability value that was used when creating the transaction object.
     * @return {String} Either "strict", "relaxed" or "default".
     */
    get durability() {
        // Return the durability value
        return this._iDbTransaction.durability;
    }

    /**
     * Gets the error that stopped the transaction from working.
     * @return {DOMException} The exception error that stopped the transaction.
     */
    get error() {
        // Return the error value
        return this._iDbTransaction.error;
    }

    /**
     * Gets the mode value that was used when creating the transaction object.
     * @return {String} Either "readonly", "readwrite" or "versionchange".
     */
    get mode() {
        // Return the mode value
        return this._iDbTransaction.mode;
    }

    /**
     * Gets the list of object store names that was used when creating the transaction object.
     * @return {DOMStringList} List of object store names. Use .item(index) or [index] to get the name.
     */
    get objectStoreNames() {
        // Return the object store names
        return this._iDbTransaction.objectStoreNames;
    }

    /**
     * Abort the transaction. This rolls back any changes made to the object stores data.
     * 
     * **WARNING:** Must be used with `async/await`.
     * @return {Promise} A promise.
     */
    abort() {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Abort the transaction
            this._iDbTransaction.abort();

            // Handle on error event
            this._iDbTransaction.onerror = () => {
                // Reject the promise with the error
                reject(this._iDbTransaction.error);
            };

            // Handle on abort event
            this._iDbTransaction.onabort = () => {
                // Resolve the promise
                resolve();
            }
        });

        // Return the promise
        return promise;
    }

    /**
     * Commit the transaction. When using the IndexedDB interface on its own
     * the transaction is automatically committed when it is finished with.
     * However, it when using promises, it is best to call the commit function
     * when you have finish all transaction linked tasks.
     * 
     * **WARNING:** Must be used with `async/await`.
     * @return {Promise} A promise.
     */
    commit() {
        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Commit the transaction
            this._iDbTransaction.commit();

            // Handle on error event
            this._iDbTransaction.onerror = () => {
                // Reject the promise with the error
                reject(this._iDbTransaction.error);
            };

            // Handle on compete
            this._iDbTransaction.oncomplete = () => {
                // Resolve the promise
                resolve();
            };
        });

        // Return the promise
        return promise;
    }

    /**
     * Get an object store object from the transaction. This will only work if you listed the object
     * store when you created the transaction.
     * @param {String} name The name of the object store.
     * @return {ObjectStore} An object store object.
     */
    objectStore(name) {
        // Get the object store interface object
        const iDbObjectStore = this._iDbTransaction.objectStore(name);

        // Create and return a ObjectStore object
        return new ObjectStore(iDbObjectStore);
    }
}