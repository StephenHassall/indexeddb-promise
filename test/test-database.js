/**
 * Test database.
 */
import { Database } from "../database.js";
import { TimeoutPromise } from "./timeout-promise.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test create 1 database
class TestCreate1Database extends Database {
    constructor() {
        super('create-database', 1);
    }

    _upgradeSchema() {
        Test.describe('Create database (version 1) _upgradeSchema');
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

    _upgradeSchema() {
        Test.describe('Create database (version 2) _upgradeSchema');
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

    _upgradeSchema() {
        // Throw error
        throw new Error('TestCreate3Database._upgradeSchema error');
    }
}

// Test create 4 database
class TestCreate4Database extends Database {
    constructor() {
        super('create-database', 4);
    }

    _upgradeSchema() {
        // Do nothing
    }
}

// Test create 5 database
class TestCreate5Database extends Database {
    constructor() {
        super('create-database', 5);
    }

    _upgradeSchema() { }

    async _upgradeData() {
        await TimeoutPromise.wait(500);
    }
}

// Test create 6 database
class TestCreate6Database extends Database {
    constructor() {
        super('create-database', 6);
    }

    _upgradeSchema() { }

    async _upgradeData() {
        return Promise.reject(new Error('TestCreate6Database._upgradeData Promise.reject'));
    }
}

// Test create 7 database
class TestCreate7Database extends Database {
    constructor() {
        super('create-database', 7);
    }

    _upgradeSchema() { }

    async _upgradeData() {
        throw new Error('TestCreate7Database._upgradeData throw error');
    }
}

// Test Version 0 database
class TestVersion0Database extends Database {
    constructor() {
        super('version-0', 0);
    }
    _upgradeSchema() { }
}

// Test Open Twice database
class TestOpenTwiceDatabase extends Database {
    constructor() {
        super('open-twice', 1);
    }
    _upgradeSchema() {
        Test.describe('Open Twice database');
        Test.assertEqual(this.version, 1);
        let objectStore1 = this.createObjectStore('objectStore1');
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
        await TestDatabase.testUpgradeNeeded();
        await TestDatabase.testErrors();
    }

    /**
     * Test upgrade needed
     */
    static async testUpgradeNeeded() {
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
            Test.assertEqual(e.message, 'TestCreate3Database._upgradeSchema error');
        }

        // Test upgrade but do nothing
        Test.describe('Open (version 4)');
        database = new TestCreate4Database();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 2);
        Test.assertEqual(objectStoreList.item(0), 'objectStore2');
        Test.assertEqual(objectStoreList.item(1), 'objectStore3');
        database.close();

        // Test upgrade data (wait)
        Test.describe('Open (version 5)');
        database = new TestCreate5Database();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 2);
        Test.assertEqual(objectStoreList.item(0), 'objectStore2');
        Test.assertEqual(objectStoreList.item(1), 'objectStore3');
        database.close();

        // Test upgrade data, promise reject
        Test.describe('Open (version 6)');
        database = new TestCreate6Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'TestCreate6Database._upgradeData Promise.reject');
        }

        // Test upgrade data, throw error
        Test.describe('Open (version 7)');
        database = new TestCreate7Database();
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'TestCreate7Database._upgradeData throw error');
        }
    }

    /**
     * Test errors
     */
    static async testErrors() {
        // Base class
        Test.describe('Base class');
        let database = new Database('base-test', 1);
        try {
            await database.open();
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Database._upgradeNeeded is not overridden');
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
    
    }
}