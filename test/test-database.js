/**
 * Test database.
 */
import { SampleDatabase } from "./sample-database.js";
import Tools from "./tools.js";
import Test from "./test.js";

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
        await TestDatabase.testCreateOpen();
    }

    /**
     * Test create open.
     */
    static async testCreateOpen() {
        // Test create
        Test.describe('Create (from empty)');
        let database = new SampleDatabase();
        await database.open();
        Test.assert(database);
        let objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 1);
        database.close();

        // Test open
        Test.describe('Open');
        database = new SampleDatabase();
        await database.open();
        Test.assert(database);
        objectStoreList = database.objectStoreNames;
        Test.assert(objectStoreList);
        Test.assertEqual(objectStoreList.length, 1);
        database.close();
    }
}