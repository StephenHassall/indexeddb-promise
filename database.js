/**
 * Indexed DB promise database.
 */
import { Transaction } from "./transaction.js";

export class Database {

    constructor(iDbDatabase) {
        this._iDbDatabase = iDbDatabase;
    }

    get iDbDatabase() {
        return this._iDbDatabase;
    }

    get version() {
        return this._iDbDatabase.version;
    }

    get name() {
        return this._iDbDatabase.name;
    }

    get objectStoreNames() {
        const list = [];
        for (let index = 0; index < this._iDbDatabase.objectStoreNames.length; index++) {
            list.push(this._iDbDatabase.objectStoreNames.item(index));
        }
        return list;
    }

    close() {
        this._iDbDatabase.close();
    }

    createObjectStore(name, options) {
        return this._iDbDatabase.createObjectStore(name, options);
    }

    deleteObjectStore(name) {
        this._iDbDatabase.deleteObjectStore(name);
    }

    transaction(storeNames, mode, options) {
        const transaction = this._iDbDatabase.transaction(storeNames, mode, options);
        const promise = new Promise((resolve, reject) => {
            

            transaction.oncomplete = (event) => {
                resolve(new Transaction(transaction));
            };

            transaction.onerror = (event) => {
                reject(event);
            };
        });

        return promise;
    }
}