/**
 * Indexed DB promise fractory.
 * Wrapper of the IDBFactory IndexedDB API object. This uses the window.indexedDB object.
 * 
 * The Factory.open function is found in the Database.open function.
 */

export class Factory {
    databases() {
        return window.indexedDB.databases;
    }

    deleteDatabase(name, options) {
        const promise = new Promise((resolve, reject) => {
            const openDbRequest = window.indexedDB.deleteDatabase(name, options);

            openDbRequest.onerror = () => {
                reject(openDbRequest.error);
            };

            openDbRequest.onsuccess = () => {
                resolve();
            };

            // Handle on blocked event
            openDbRequest.onblocked = () => {
                // Reject the promise with the error
                reject(openDbRequest.error);
            }
        });

        return promise;
    }

}