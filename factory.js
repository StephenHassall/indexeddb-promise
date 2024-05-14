/**
 * Indexed DB promise factory.
 */
import { Database } from "./database.js";

export class Factory {

    static _versionMap = new Map();


    static open(name) {
        if (Factory._versionMap.has(name) === false) {
            throw new Error('You must call upgradeNeeded first');
        }
        const version = Factory._versionMap.get(name);

        const promise = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(name, version);

            request.onerror = (event) => {
                reject(event);
            };

            request.onsuccess = (event) => {
                resolve(new Database(request.result));
            };

            this._request.onupgradeneeded = (event) => {
                reject(new Error('Upgrade was needed'));
            };
        });

        return promise;
    }

    static upgradeNeeded(name, version) {

        Factory._versionMap.set(name, version);

        const promise = new Promise((resolve, reject) => {

            const openDbRequest = window.indexedDB.open(name, version);

            openDbRequest.onerror = (event) => {
                reject(event);
            };

            openDbRequest.onsuccess = (event) => {
                resolve();
            };

            openDbRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                resolve(new Database(db));
            };

            openDbRequest.onblock = (event) => {
                reject(event);
            }
        });

        return promise;
    }

    static deleteDatabase(name, options) {
        const result = window.indexedDB.deleteDatabase(name, options)
    }

    static databases() {
        return window.indexedDB.databases;
    }
}