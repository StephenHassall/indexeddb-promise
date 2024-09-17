/**
 * Test database.
 */
import { Database } from "../database.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test create 1 database
class TestCreate1Database extends Database {
    constructor() {
        super('create-database', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Create database (version 1) _upgrade');
        Test.assertEqual(this.version, 1);
        let objectStore1 = this.createObjectStore('objectStore1');
        Test.assert(objectStore1);
    }
}

// Test create 2 database
class TestCreate2Database extends Database {
    constructor() {
        super('create-database', 2);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Create database (version 2) _upgrade');
        Test.assertEqual(this.version, 2);
        let objectStore2 = this.createObjectStore('objectStore2');
        Test.assert(objectStore2);
        let objectStore3 = this.createObjectStore('objectStore3');
        Test.assert(objectStore3);
        this.deleteObjectStore('objectStore1');
    }
}

// Test create 3 database
class TestCreate3Database extends Database {
    constructor() {
        super('create-database', 3);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        // Throw error
        throw new Error('TestCreate3Database._upgrade error');
    }
}

// Test create 4 database
class TestCreate4Database extends Database {
    constructor() {
        super('create-database', 4);
    }

    async _upgrade(transaction, oldVersion, newVersion) {
        // Throw error
        throw new Error('TestCreate4Database._upgrade error');
    }
}

// Test create 5 database
class TestCreate5Database extends Database {
    constructor() {
        super('create-database', 5);
    }

    async _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Create database (version 5) _upgrade');
        Test.assertEqual(this.version, 5);
        let objectStore4 = this.createObjectStore('objectStore4');
        Test.assert(objectStore4);
        const b = await objectStore4.count();
        let objectStore5 = this.createObjectStore('objectStore5');
        Test.assert(objectStore5);
    }
}

// Test Version Check 1 database
class TestVersionCheck1Database extends Database {
    constructor() {
        super('version-check', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        Test.assertEqual(oldVersion, 0);
        Test.assertEqual(newVersion, 1);
    }
}

// Test Version Check 2 database
class TestVersionCheck2Database extends Database {
    constructor() {
        super('version-check', 2);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        throw new Error('Version 2 upgrade error');
    }
}

// Test Version Check 3 database
class TestVersionCheck3Database extends Database {
    constructor() {
        super('version-check', 3);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        Test.assertEqual(oldVersion, 1);
        Test.assertEqual(newVersion, 3);
    }
}

// Test Version 0 database
class TestVersion0Database extends Database {
    constructor() {
        super('version-0', 0);
    }
    _upgrade(transaction, oldVersion, newVersion) { }
}

// Test Delete Unknown Object Store database
class TestDeleteUnknownObjectStoreDatabase extends Database {
    constructor() {
        super('unknown-database', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        this.deleteObjectStore('unknown-objectStore');
    }
}

// Test Create Duplicate Object Store database
class TestCreateDuplicateObjectStoreDatabase extends Database {
    constructor() {
        super('duplicate-database', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        this.createObjectStore('objectStore');
        this.createObjectStore('objectStore');
    }
}

// Test Open Twice database
class TestOpenTwiceDatabase extends Database {
    constructor() {
        super('open-twice', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Open Twice database');
        Test.assertEqual(this.version, 1);
        let objectStore1 = this.createObjectStore('objectStore1');
        Test.assert(objectStore1);
    }
}

// Test blocked 1 database
class TestBlocked1Database extends Database {
    constructor() {
        super('blocked', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Blocked (1)');
        Test.assertEqual(this.version, 1);
        let objectStore1 = this.createObjectStore('objectStore1');
        Test.assert(objectStore1);
    }
}

// Test blocked 2 database
class TestBlocked2Database extends Database {
    constructor() {
        super('blocked', 2);
    }
    _upgrade(transaction, oldVersion, newVersion) {
        Test.describe('Blocked (2)');
        Test.assertEqual(this.version, 2);
        let objectStore1 = this.createObjectStore('objectStore2');
        Test.assert(objectStore1);
    }
}

// Main testing
export default class TestDatabase {
    /**
     * Run all the database tests.
     */
    static async run() {
        // Set test
        Test.test('Database');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestDatabase.testUpgrade();
        await TestDatabase.testVersions();
        await TestDatabase.testErrors();
    }

    /**
     * Test upgrade.
     */
    static async testUpgrade() {
        // Test create (version 1)
        Test.describe('Create (from empty) (version 1)');
        let database = new TestCreate1Database();
        await database.open();
        Test.assert(database);
        let objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 1);
        database.close();

        // Test open
        Test.describe('Open (version 1)');
        database = new TestCreate1Database();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 1);
        database.close();

        // Test open
        Test.describe('Open (version 2)');
        database = new TestCreate2Database();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 2);
        Test.assertEqual(objectStoreList.item(0), 'objectStore2');
        Test.assertEqual(objectStoreList.item(1), 'objectStore3');
        database.close();

        // Test opening over version
        Test.describe('Open (version 1)');
        database = new TestCreate1Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'The requested version (1) is less than the existing version (2).');
        }

        // Test upgrade throws error
        Test.describe('Open (version 3)');
        database = new TestCreate3Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'TestCreate3Database._upgrade error');
        }

        // Test async upgrade throws error
        Test.describe('Open (version 4)');
        database = new TestCreate4Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'TestCreate4Database._upgrade error');
        }

        // Test upgrade but do nothing
        Test.describe('Open (version 5)');
        database = new TestCreate5Database();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 4);
        Test.assertEqual(objectStoreList.item(0), 'objectStore2');
        Test.assertEqual(objectStoreList.item(1), 'objectStore3');
        Test.assertEqual(objectStoreList.item(2), 'objectStore4');
        Test.assertEqual(objectStoreList.item(3), 'objectStore5');
        database.close();
    }

    /**
     * Test versions.
     */
    static async testVersions() {
        // Version check 1
        Test.describe('Version check 1');
        let database = new TestVersionCheck1Database();
        await database.open();
        Test.assertEqual(database.version, 1);
        database.close();

        // Version check 2
        Test.describe('Version check 2');
        database = new TestVersionCheck2Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Version 2 upgrade error');
        }

        // Version check 3
        Test.describe('Version check 3');
        database = new TestVersionCheck3Database();
        await database.open();
        Test.assertEqual(database.version, 3);
        database.close();
    }

    /**
     * Test errors.
     */
    static async testErrors() {
        // Base class
        Test.describe('Base class');
        let database = new Database('base-test', 1);
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Database._upgrade is not overridden');
        }

        // Version 0
        Test.describe('Version 0');
        database = new TestVersion0Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'open\' on \'IDBFactory\': The version provided must not be 0.');
        }

        // Delete unknown object store
        Test.describe('Delete unknown object store');
        database = new TestDeleteUnknownObjectStoreDatabase();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'deleteObjectStore\' on \'IDBDatabase\': The specified object store was not found.');
        }

        // Create duplicate object store
        Test.describe('Create duplicate object store');
        database = new TestCreateDuplicateObjectStoreDatabase();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'createObjectStore\' on \'IDBDatabase\': An object store with the specified name already exists.');
        }

        // Already open Twice
        Test.describe('Open twice');
        database = new TestOpenTwiceDatabase();
        await database.open();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Already open');
        }
        database.close();
        
        // Open Twice
        Test.describe('Open twice');
        database = new TestOpenTwiceDatabase();
        let database2 = new TestOpenTwiceDatabase();
        await database.open();
        await database2.open();
        Test.assert(database);
        Test.assert(database.iDbDatabase);
        Test.assert(database2);
        Test.assert(database2.iDbDatabase);
        database.close();
        database2.close();

        // Calling createObjectStore outside upgrade
        Test.describe('Calling createObjectStore outside upgrade');
        database = new TestOpenTwiceDatabase();
        await database.open();
        try {
            database.createObjectStore('new-object-store');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'createObjectStore\' on \'IDBDatabase\': The database is not running a version change transaction.');
        }
        database.close();

        // Calling deleteObjectStore outside upgrade
        Test.describe('Calling deleteObjectStore outside upgrade');
        database = new TestOpenTwiceDatabase();
        await database.open();
        try {
            database.deleteObjectStore('objectStore1');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'deleteObjectStore\' on \'IDBDatabase\': The database is not running a version change transaction.');
        }
        database.close();

        // Handle blocked database
        Test.describe('Blocked');
        database = new TestBlocked1Database();
        database2 = new TestBlocked2Database();
        await database.open();
        Test.assert(database);
        Test.assert(database.iDbDatabase);
        try {
            await database2.open();
        } catch (e) {
            Test.assertEqual(e.message, 'Blocked');
        }
        database.close();
        await database2.open();
        Test.assert(database2);
        Test.assert(database2.iDbDatabase);
        database2.close();
    }
}