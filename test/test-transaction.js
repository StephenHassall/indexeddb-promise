/**
 * Test transaction.
 */
import { Database } from "../database.js";
import { Transaction } from "../transaction.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test transaction database
class TestTransactionDatabase extends Database {
    constructor() {
        super('factory-database', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        // Create 3 object stores
        this.createObjectStore('object-store1');
        this.createObjectStore('object-store2', { keyPath: 'id' });
        this.createObjectStore('object-store3', { keyPath: 'id', autoIncrement: true });
    }
}

// Main testing
export default class TestTransaction {
    /**
     * Run all the transaction tests.
     */
    static async run() {
        // Set test
        Test.test('Transaction');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        //await TestTransaction.testObjectStoreNames();
        //await TestTransaction.testCreateTransaction();
        //await TestTransaction.testAbort();
        await TestTransaction.testCommit();
    }

    /**
     * Test object store names.
     */
    static async testObjectStoreNames() {
        // Test not store objects (empty array)
        Test.describe('No object stores');
        let database = new TestTransactionDatabase();
        await database.open();
        try {
            let transaction = database.transaction([]);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'transaction\' on \'IDBDatabase\': The storeNames parameter was empty.');
        }
        database.close();

        // Test empty object store
        Test.describe('Empty object store');
        database = new TestTransactionDatabase();
        await database.open();
        try {
            let transaction = database.transaction('');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'transaction\' on \'IDBDatabase\': One of the specified object stores was not found.');
        }
        database.close();

        // Test unknown oject store name
        Test.describe('Unknown object store name');
        database = new TestTransactionDatabase();
        await database.open();
        try {
            let transaction = database.transaction('unknown');
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'transaction\' on \'IDBDatabase\': One of the specified object stores was not found.');
        }
        database.close();

        // Test one unknown oject store name
        Test.describe('One unknown object store name');
        database = new TestTransactionDatabase();
        await database.open();
        try {
            let transaction = database.transaction(['object-store1', 'unknown', 'object-store2']);
            Test.assert();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'transaction\' on \'IDBDatabase\': One of the specified object stores was not found.');
        }
        database.close();

        // Test one oject store
        Test.describe('One object store');
        database = new TestTransactionDatabase();
        await database.open();
        let transaction = database.transaction('object-store1');
        Test.assert(transaction);
        let objectStoreNameList = transaction.objectStoreNames;
        Test.assert(objectStoreNameList);
        Test.assertEqual(objectStoreNameList.length, 1);
        Test.assertEqual(objectStoreNameList[0], 'object-store1');
        database.close();

        // Test two oject store
        Test.describe('Two object store');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction(['object-store1', 'object-store2']);
        Test.assert(transaction);
        objectStoreNameList = transaction.objectStoreNames;
        Test.assert(objectStoreNameList);
        Test.assertEqual(objectStoreNameList.length, 2);
        Test.assertEqual(objectStoreNameList[0], 'object-store1');
        Test.assertEqual(objectStoreNameList[1], 'object-store2');
        database.close();

        // Test three oject store
        Test.describe('Three object store');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction(['object-store3', 'object-store1', 'object-store2']);
        Test.assert(transaction);
        objectStoreNameList = transaction.objectStoreNames;
        Test.assert(objectStoreNameList);
        Test.assertEqual(objectStoreNameList.length, 3);
        Test.assertEqual(objectStoreNameList[0], 'object-store1');
        Test.assertEqual(objectStoreNameList[1], 'object-store2');
        Test.assertEqual(objectStoreNameList[2], 'object-store3');
        database.close();
    }

    /**
     * Test create transaction.
     */
    static async testCreateTransaction() {
        // Test defaults
        Test.describe('Defaults');
        let database = new TestTransactionDatabase();
        await database.open();
        let transaction = database.transaction('object-store1');
        Test.assert(transaction);
        Test.assertEqual(transaction.mode, 'readonly');
        Test.assertEqual(transaction.durability, 'default');
        database.close();

        // Test readonly
        Test.describe('Readonly');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction('object-store1', 'readonly');
        Test.assert(transaction);
        Test.assertEqual(transaction.mode, 'readonly');
        database.close();

        // Test readwrite
        Test.describe('Readwrite');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        Test.assertEqual(transaction.mode, 'readwrite');
        database.close();

        // Test strict
        Test.describe('Strict');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction('object-store1', undefined, { durability: 'strict' });
        Test.assert(transaction);
        Test.assertEqual(transaction.mode, 'readonly');
        Test.assertEqual(transaction.durability, 'strict');
        database.close();

        // Test strict
        Test.describe('relaxed');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction('object-store1', undefined, { durability: 'relaxed' });
        Test.assert(transaction);
        Test.assertEqual(transaction.mode, 'readonly');
        Test.assertEqual(transaction.durability, 'relaxed');
        database.close();
    }

    /**
     * Test abort.
     */
    static async testAbort() {
        // Test abort empty
        Test.describe('Abort empty');
        let database = new TestTransactionDatabase();
        await database.open();
        let transaction = database.transaction('object-store2', 'readwrite');
        await transaction.abort();
        database.close();

        // Test abort add
        Test.describe('Abort add');
        database = new TestTransactionDatabase();
        await database.open();
        transaction = database.transaction('object-store2', 'readwrite');
        let objectStore = transaction.objectStore('object-store2');
        await objectStore.add({ id: 1, text: 'hello' });
        await transaction.abort();
        database.close();
        await database.open();
        transaction = database.transaction('object-store2', 'readonly');
        objectStore = transaction.objectStore('object-store2');
        const count = await objectStore.count();
        Test.assertEqual(count, 0);
        database.close();
    }

    /**
     * Test commit
     */
    static async testCommit() {
        // Test commit empty
        Test.describe('Commit empty');
        let database = new TestTransactionDatabase();
        await database.open();
        let transaction = database.transaction('object-store2', 'readwrite');
        await transaction.commit();
        database.close();

        // Test commit add
        Test.describe('Commit add');
        database = new TestTransactionDatabase();
        // Clear first
        await database.open();
        transaction = database.transaction('object-store2', 'readwrite');
        let objectStore = transaction.objectStore('object-store2');
        await objectStore.clear();
        await transaction.commit();
        database.close();
        // Add commit
        await database.open();
        transaction = database.transaction('object-store2', 'readwrite');
        objectStore = transaction.objectStore('object-store2');
        await objectStore.add({ id: 1, text: 'hello' });
        await transaction.commit();
        database.close();
        // Check it worked
        await database.open();
        transaction = database.transaction('object-store2', 'readwrite');
        objectStore = transaction.objectStore('object-store2');
        const count = await objectStore.count();
        Test.assertEqual(count, 1);
        database.close();
    }
}