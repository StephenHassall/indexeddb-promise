/**
 * Indexed DB promise database.
 * Wrapper of the IDBDatabase IndexedDB API object.
 * Do not create an instance of this class, but create your own class that
 * derives from it.
 */
import { ObjectStore } from "./objectStore.js";
import { Transaction } from "./transaction.js";

export class Database {
    /**
     * Base database constructor.
     * @param {String} name The name of the database.
     * @param {Number} version An integer version number of the database.
     */
    constructor(name, version) {
        // Set members
        this._name = name;
        this._version = version;

        // Clear database interface object
        this._iDbDatabase = undefined;
    }

    /**
     * Get database interface object.
     * @return {IDBDatabase} The database object.
     */
    get iDbDatabase() {
        // Return the database intergace object
        return this._iDbDatabase;
    }

    /**
     * Get the current database version.
     * @return {Number} The version integer value.
     */
    get version() {
        // Return the version value
        return this._iDbDatabase.version;
    }

    /**
     * Get the database name.
     * @return {String} Then name of the database.
     */
    get name() {
        // Return the name value
        return this._iDbDatabase.name;
    }

    /**
     * Get the list of object store names. Use the .item(index) to get the name value.
     * @return {DOMStringList} The list of object store names.
     */
    get objectStoreNames() {
        // Return the object store names
        return this._iDbDatabase.objectStoreNames;
    }

    /**
     * Open the database. This checks to see if the version is newer than the current one on
     * the browser, and if so then it will call the _onUpgradeNeeded override function. You need
     * to override this function to create/upgrade the database object stores and indexes.
     * @return {Promise} A promise.
     */
    open() {
        // If already open
        if (this._iDbDatabase) throw new Error('Already open');

        // Create promise
        const promise = new Promise((resolve, reject) => {
            // Set open the request object
            let openDbRequest = undefined;

            // Set upgraded error
            let upgradedError = undefined;

            // Set upgraded
            let upgraded = false;

            try {
                // Open the database
                openDbRequest = window.indexedDB.open(this._name, this._version);
            } catch (error) {
                // Reject with the error and stop
                reject(error);
                return;
            }
            
            // Handle on error event
            openDbRequest.onerror = () => {
                // Clear interface value
                this._iDbDatabase = undefined;

                // If there is an upgrade error then reject with that instead of the error
                if (upgradedError)  { reject(upgradedError); return; }

                // Reject the promise with the error
                reject(openDbRequest.error);
            };

            // Handle on success event
            openDbRequest.onsuccess = () => {
                // Set the database interface
                this._iDbDatabase = openDbRequest.result;

                // Set close event
                this._iDbDatabase.onclose = () => {
                    // Call _close overrided event
                    this._close();
                }

                // Set version change event
                this._iDbDatabase.onversionchange = () => {
                    // Call _versionChange overrided event
                    this._versionChange();
                }

                // If not upgraded
                if (upgraded === false) {
                    // Resolve the promise and stop here
                    resolve();
                    return;
                }

                // Call the upgrade data override
                this._upgradeData().then(() => {
                    // Resolve the open promise
                    resolve();
                }, (error) => {
                    // Close database interface
                    this._iDbDatabase.close();

                    // Clear interface value
                    this._iDbDatabase = undefined;

                    // Reject the open promise with the error
                    reject(error);
                });
            };

            // Handle on upgrade needed event
            openDbRequest.onupgradeneeded = (event) => {
                // Set the database interface
                this._iDbDatabase = event.target.result;

                // Set upgraded
                upgraded = true;

                try {
                    // Call the on upgrade needed override
                    this._upgradeSchema();
                } catch (error) {
                    // Set the upgrade error
                    upgradedError = error;

                    // Manually abort the upgrade transaction (this forces the upgrade to stop)
                    openDbRequest.transaction.abort();
                }
            };

            // Handle on blocked event
            openDbRequest.onblocked = () => {
                // Reject the promise with the error
                reject(openDbRequest.error);
            }
        });

        // Return the promise
        return promise;
    }

    /**
     * Close the database.
     */
    close() {
        // Close the database
        this._iDbDatabase.close();

        // Clear interface value
        this._iDbDatabase = undefined;
    }

    /**
     * Create a new object store in the database. This can only be used when the database is being
     * upgraded.
     * @param {String} name The name of the object store.
     * @param {Object} [options] The object store options.
     * @param {String} [options.keyPath] The name of the property that will be the default key.
     * @param {Boolean} [options.autoIncrement=false] Will the key be automatically increased for each new record.
     * @return {ObjectStore} A ObjectStore object linked to the new object store in the database.
     */
    createObjectStore(name, options) {
        // Create new object store
        const iDbObjectStore = this._iDbDatabase.createObjectStore(name, options);

        // Create and return an ObjectStore object
        return new ObjectStore(iDbObjectStore);
    }

    /**
     * Delete an object store with the given name.
     * @param {String} name The name of the object store.
     */
    deleteObjectStore(name) {
        // Delete the object store
        this._iDbDatabase.deleteObjectStore(name);
    }

    /**
     * Create a transaction object that you can use to perform multiple operations on
     * different object stores, adding new records, removing old ones, etc.
     * @param {String|String[]} storeNames Either a single object store name, or a list of those
     * that you will be interacting with. You can not perform write operations on the same object store
     * at the same time.
     * @param {String} [mode] The type of mode being used. This can be either "readonly", "readwrite" or "readwriteflush".
     * @param {Object} [options] A number of different options.
     * @param {String} [options.durability] Either "strict", "relaxed" or "default".
     * @return {Transaction} A transaction object.
     */
    transaction(storeNames, mode, options) {
        // Create transaction
        const iDbTransaction = this._iDbDatabase.transaction(storeNames, mode, options);

        // Create and return a Transaction object
        return new Transaction(iDbTransaction);
    }

    /**
     * Override function that is called when the database is opened and there is a new version
     * which needs to be upgraded. Replace this function to update the schema parts. You can only
     * add and remove object stores. If you want to upgrade any of the data then override the
     * the _upgradeData function.
     * @override
     */
    _upgradeSchema() {
        // Must never get here
        throw new Error('Database._upgradeNeeded is not overridden');
    }

    /**
     * Override function that is called when the database is opened and there is a new version
     * which needs to be upgraded. Replace this function to update the data parts. You can add,
     * update or remove and of the data within the object stores. You can not add or remove
     * object stores. To do that use the _upgradeSchema function.
     * @return {Promise} A promise. You can use this override with the async prefix.
     */
    _upgradeData() {
        // The default process is to do nothing. Just return a resolved promise
        return Promise.resolve();
    }

    /**
     * Override function that is called when the database is closed unexpectedly.
     * It is not fired when the Database.close function is called.
     * @override
     */
    _close() { }

    /**
     * Override function that is called when the database is upgrade from elsewhere, in
     * another tab for example.
     */
    _versionChange() { }
}