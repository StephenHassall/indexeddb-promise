/**
 * Tools for indexed DB promise testing
 */

export default class Tools {
    /**
     * Delete all the databases.
     */
    static async deleteAllDatabases() {
        // Get list of databases
        const databaseInfoList = await window.indexedDB.databases();

        // Create list of promises
        const promiseList = [];

        // For each database info
        databaseInfoList.forEach(async (databaseInfo) => {
            // Create promise and add it to the list
            promiseList.push(Tools.deleteDatabase(databaseInfo.name));
        });

        // Perform all the delete database promises
        await Promise.all(promiseList);
    }

    /**
     * Delete a database
     * @param {String} name The name of the database to delete.
     * @return {Promise} A promise.
     */
    static async deleteDatabase(name) {
        // Create a promise
        const promise = new Promise((resolve, reject) => {
            // Delete the database
            const request = window.indexedDB.deleteDatabase(name);

            // Set on error
            request.onerror = () => {
                // Reject the promise
                reject(request.error);
            };

            // Set on success
            request.onsuccess = () => {
                // Resolve the promise
                resolve();
            };

            // Set on blocked
            request.onblocked = () => {
                // Reject the promise
                reject(new Error('Blocked'));
            }
        });

        // Return the promise
        return promise;
    }
}