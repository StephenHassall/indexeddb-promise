/**
 * Indexed DB promise transaction.
 * Wrapper of the IDBTransaction IndexedDB API object.
 */
import { ObjectStore } from "./objectStore.js";

export class Transaction {
    /**
     * Transaction constructor.
     * @param {IDBTransaction} iDbTransaction The transaction interface object.
     */
    constructor(iDbTransaction) {
        // Set transaction interface object
        this._iDbTransaction = iDbTransaction;
    }

    get db() {
        return this._iDbTransaction.db;
    }

    get durability() {
        return this._iDbTransaction.durability;
    }

    get error() {
        return this._iDbTransaction.error;
    }

    get mode() {
        return this._iDbTransaction.mode;
    }

    get objectStoreNames() {
        return this._iDbTransaction.objectStoreNames;
    }

    abort() {
        const promise = new Promise((resolve, reject) => {
            this._iDbTransaction.abort();

            this._iDbTransaction.onerror = () => {
                reject(this._iDbTransaction.error);
            };

            this._iDbTransaction.onabort = () => {
                resolve();
            };
        });

        return promise;

    }

    commit() {
        const promise = new Promise((resolve, reject) => {
            this._iDbTransaction.commit();

            this._iDbTransaction.onerror = () => {
                reject(this._iDbTransaction.error);
            };

            this._iDbTransaction.onsuccess = () => {
                resolve();
            };
        });

        return promise;
    }

    objectStore(name) {
        // Get the object store interface object
        const iDbObjectStore = this._iDbTransaction.objectStore(name);

        // Create and return a ObjectStore object
        return new ObjectStore(iDbObjectStore);
    }
}