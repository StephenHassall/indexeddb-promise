/**
 * Example, new version. This shows how the database can be upgraded to
 * a newer version.
 */
import { Database } from "../../database.js";
import { Factory } from "../../factory.js";

// Cats version 1 database. This is used to simulate the older version of the Cat database.
class CatVersion1Database extends Database {
    constructor() {
        super('cat', 1);
    }

    /**
     * The upgrade override is only called when the database open function is used and
     * there is either no database on the client, or it contains an older version.
     */
    _upgrade(transaction, oldVersion, newVersion) {
        // Create breed object store
        let breedObjectStore = this.createObjectStore('breed', { keyPath: 'id', autoIncrement: true });

        // Add index
        breedObjectStore.createIndex('index-name', 'name', { unique: true });
    }
}

// Cat Database. This is the latest version
class CatDatabase extends Database {
    constructor() {
        super('cat', 2);
    }

    /**
     * When opening this database it will see that the cat database version is newer and an upgrade
     * is required.
     */
    _upgrade(transaction, oldVersion, newVersion) {
        // Get breed object store
        let breedObjectStore = transaction.objectStore('breed');

        // Add a new index
        breedObjectStore.createIndex('index-origin', 'origin');

        // Create new object store
        this.createObjectStore('origin-county', { keyPath: 'id', autoIncrement: true });
    }
}

/**
 * Delete the cat database.
 */
window.deleteCatDatabase = function () {
    // Delete the cat database
    Factory.deleteDatabase('cat');
};

/**
 * Create the cat version 1 database.
 */
window.createCatVersionDatabase = async function () {
    // Create cat database object
    const catVersion1Database = new CatVersion1Database();

    // Open the database
    await catVersion1Database.open();

    // Close the database
    catVersion1Database.close();
};

/**
 * Open cat database.
 */
window.openCatDatabase = async function () {
    // Create cat database object
    const catDatabase = new CatDatabase();

    // Open the database
    await catDatabase.open();

    // Close the database
    catDatabase.close();
};


