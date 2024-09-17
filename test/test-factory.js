/**
 * Test factory.
 */
import { Database } from "../database.js";
import { Factory } from "../factory.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test factory 1 database
class TestFactory1Database extends Database {
    constructor() {
        super('factory1-database', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) { }
}

// Test factory 2 database
class TestFactory2Database extends Database {
    constructor() {
        super('factory2-database', 2);
    }

    _upgrade(transaction, oldVersion, newVersion) { }
}

// Test factory delete blocked database
class TestFactoryDeleteBlockedDatabase extends Database {
    constructor() {
        super('factory-delete-blocked', 1);
    }
    _upgrade(transaction, oldVersion, newVersion) { }
}

// Main testing
export default class TestFactory {
    /**
     * Run all the factory tests.
     */
    static async run() {
        // Set test
        Test.test('Factory');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestFactory.testDatabases();
        await TestFactory.testDeleteDatabase();
    }

    /**
     * Test databases.
     */
    static async testDatabases() {
        // Test no database
        Test.describe('No databases');
        let databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 0);

        // Test one database
        Test.describe('One database');
        let database = new TestFactory1Database();
        await database.open();
        database.close();
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 1);
        Test.assertEqual(databases[0].name, 'factory1-database');
        Test.assertEqual(databases[0].version, 1);

        // Test two database
        Test.describe('Two database');
        database = new TestFactory2Database();
        await database.open();
        database.close();
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 2);
        Test.assertEqual(databases[0].name, 'factory1-database');
        Test.assertEqual(databases[0].version, 1);
        Test.assertEqual(databases[1].name, 'factory2-database');
        Test.assertEqual(databases[1].version, 2);
    }

    /**
     * Test delete database.
     */
    static async testDeleteDatabase() {
        // Delete one
        Test.describe('Delete one');
        let database = new TestFactory1Database();
        await database.open();
        database.close();
        database = new TestFactory2Database();
        await database.open();
        database.close();
        let databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 2);
        Test.assertEqual(databases[0].name, 'factory1-database');
        Test.assertEqual(databases[0].version, 1);
        Test.assertEqual(databases[1].name, 'factory2-database');
        Test.assertEqual(databases[1].version, 2);
        await Factory.deleteDatabase('factory1-database');
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 1);
        Test.assertEqual(databases[0].name, 'factory2-database');
        Test.assertEqual(databases[0].version, 2);

        // Delete again
        Test.describe('Delete again');
        await Factory.deleteDatabase('factory1-database');
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 1);
        Test.assertEqual(databases[0].name, 'factory2-database');
        Test.assertEqual(databases[0].version, 2);

        // Delete two
        Test.describe('Delete two');
        await Factory.deleteDatabase('factory2-database');
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 0);

        // Delete blocked
        Test.describe('Blocked');
        database = new TestFactoryDeleteBlockedDatabase();
        await database.open();
        try {
            await Factory.deleteDatabase('factory-delete-blocked');
        } catch (e) {
            Test.assertEqual(e.message, 'Blocked');
        }
        database.close();
        await Factory.deleteDatabase('factory-delete-blocked');
        databases = await Factory.databases();
        Test.assert(databases);
        Test.assertEqual(databases.length, 0);
    }
}