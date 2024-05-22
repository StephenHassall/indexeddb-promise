/**
 * Test object store.
 */
import { Database } from "../database.js";
import { Transaction } from "../transaction.js";
import { ObjectStore } from "../object-store.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test object store database
class TestObjectStoreDatabase extends Database {
    constructor() {
        super('object-store', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        // Create object stores and indexes
        const objectStore1 = this.createObjectStore('object-store1');
        objectStore1.createIndex('index1', 'name', { unique: true });
        objectStore1.createIndex('index2', 'age', { unique: false });
        this.createObjectStore('object-store2', { keyPath: 'id' });
        this.createObjectStore('object-store3', { keyPath: 'id', autoIncrement: true });
    }
}

// Main testing
export default class TestObjectStore {
    /**
     * Run all the object store tests.
     */
    static async run() {
        // Set test
        Test.test('Object Store');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestObjectStore.testCreate();
        await TestObjectStore.testAdd();
        await TestObjectStore.testPut();
        await TestObjectStore.testClear();
        await TestObjectStore.testDelete();
        await TestObjectStore.testGet();
        await TestObjectStore.testGetAll();
        await TestObjectStore.testGetKey();
        await TestObjectStore.testGetAllKeys();
        await TestObjectStore.testOpenCursor();
        await TestObjectStore.testOpenKeyCursor();
    }

    /**
     * Test create.
     */
    static async testCreate() {
        // Test auto increment
        Test.describe('Auto increment');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        await database.open();
        let transaction = database.transaction(['object-store1', 'object-store3']);
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        Test.assertEqual(objectStore1.autoIncrement, false);
        let objectStore3 = transaction.objectStore('object-store3');
        Test.assert(objectStore3);
        Test.assertEqual(objectStore3.autoIncrement, true);
        database.close();

        // Test index names
        Test.describe('Index names');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction(['object-store1', 'object-store2']);
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let indexNames = objectStore1.indexNames;
        Test.assertEqual(indexNames.length, 2);
        Test.assertEqual(indexNames[0], 'index1');
        Test.assertEqual(indexNames[1], 'index2');
        let objectStore2 = transaction.objectStore('object-store2');
        Test.assert(objectStore2);
        indexNames = objectStore2.indexNames;
        Test.assertEqual(indexNames.length, 0);
        database.close();

        // Test key path
        Test.describe('Key path');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store2');
        Test.assert(transaction);
        objectStore2 = transaction.objectStore('object-store2');
        Test.assert(objectStore2);
        Test.assertEqual(objectStore2.keyPath, 'id');
        database.close();

        // Test name
        Test.describe('Name');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction(['object-store1', 'object-store2', 'object-store3']);
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        objectStore2 = transaction.objectStore('object-store2');
        objectStore3 = transaction.objectStore('object-store3');
        Test.assert(objectStore1);
        Test.assert(objectStore2);
        Test.assert(objectStore3);
        Test.assertEqual(objectStore1.name, 'object-store1');
        Test.assertEqual(objectStore2.name, 'object-store2');
        Test.assertEqual(objectStore3.name, 'object-store3');
        database.close();
    }

    /**
     * Test add.
     */
    static async testAdd() {
        // Test add with key
        Test.describe('Add with key');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let key = await objectStore1.add({ text: 'hello' }, 1);
        Test.assertEqual(key, 1);
        key = await objectStore1.add({ text: 'world' }, 2);
        Test.assertEqual(key, 2);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let count = await objectStore1.count();
        Test.assertEqual(count, 2);
        database.close();

        // Test add just data
        Test.describe('Add just data');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store2', 'readwrite');
        Test.assert(transaction);
        let objectStore2 = transaction.objectStore('object-store2');
        Test.assert(objectStore2);
        key = await objectStore2.add({ id: 1, text: 'hello' });
        Test.assertEqual(key, 1);
        key = await objectStore2.add({ id: 2, text: 'world' });
        Test.assertEqual(key, 2);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store2');
        Test.assert(transaction);
        objectStore2 = transaction.objectStore('object-store2');
        Test.assert(objectStore2);
        count = await objectStore2.count();
        Test.assertEqual(count, 2);
        database.close();

        // Test add auto increase
        Test.describe('Add auto increase');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store3', 'readwrite');
        Test.assert(transaction);
        let objectStore3 = transaction.objectStore('object-store3');
        Test.assert(objectStore3);
        key = await objectStore3.add({ text: 'hello' });
        Test.assertEqual(key, 1);
        key = await objectStore3.add({ text: 'world' });
        Test.assertEqual(key, 2);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store3');
        Test.assert(transaction);
        objectStore3 = transaction.objectStore('object-store3');
        Test.assert(objectStore3);
        count = await objectStore3.count();
        Test.assertEqual(count, 2);
        database.close();

        // Test nothing
        Test.describe('Add nothing');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        try {
            await objectStore1.add();
        } catch (e) {
            Test.assertEqual(e.message, 'Failed to execute \'add\' on \'IDBObjectStore\': The object store uses out-of-line keys and has no key generator and the key parameter was not provided.');
        }
        await objectStore1.add({ text: 'hello' }, 3);
        await objectStore1.add({ text: 'world' }, 4);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        count = await objectStore1.count();
        Test.assertEqual(count, 2);
        database.close();
    }

    /**
     * Test put.
     */
    static async testPut() {
        // Test add with key
        Test.describe('Put with key');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        let key = await objectStore1.add({ text: 'hello' }, 1);
        Test.assertEqual(key, 1);
        key = await objectStore1.add({ text: 'world' }, 2);
        Test.assertEqual(key, 2);
        await transaction.commit();
        database.close();
        // Put (update)
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        key = await objectStore1.put({ text: 'hello-updated' }, 1);
        Test.assertEqual(key, 1);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let record = await objectStore1.get(1);
        Test.assertEqual(record.text, 'hello-updated');
        database.close();
    }

    /**
     * Test clear.
     */
    static async testClear() {
        // Test clear
        Test.describe('Clear');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Clear
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        await objectStore1.clear();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let count = await objectStore1.count();
        Test.assertEqual(count, 0);
        database.close();
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        count = await objectStore1.count();
        Test.assertEqual(count, 2);
        database.close();
        // Clear
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        await objectStore1.clear();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        count = await objectStore1.count();
        Test.assertEqual(count, 0);
        database.close();
    }

    /**
     * Test delete.
     */
    static async testDelete() {
        // Test delete key
        Test.describe('Delete key');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Delete
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.delete(1);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let count = await objectStore1.count();
        Test.assertEqual(count, 1);
        database.close();

        // Test delete not found
        Test.describe('Delete not found');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Delete
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.delete(3);
        await transaction.commit();
        database.close();
        // Check
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        count = await objectStore1.count();
        Test.assertEqual(count, 2);
        database.close();

    }

    /**
     * Test get.
     */
    static async testGet() {
        // Test get key
        Test.describe('Get key');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let record = await objectStore1.get(2);
        Test.assert(record);
        Test.assertEqual(record.text, 'world');
        database.close();

        // Test get missing key
        Test.describe('Get missing key');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        record = await objectStore1.get(3);
        Test.assertEqual(record, undefined);
        database.close();

        // Test get first
        Test.describe('Get first');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'first world' }, 2);
        await objectStore1.add({ text: 'second world' }, 3);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        record = await objectStore1.get(IDBKeyRange.lowerBound(2));
        Test.assert(record);
        Test.assertEqual(record.text, 'first world');
        database.close();
    }

    /**
     * Test get all
     */
    static async testGetAll() {
        // Test get all
        Test.describe('Get all');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let recordList = await objectStore1.getAll();
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 2);
        Test.assertEqual(recordList[0].text, 'hello');
        Test.assertEqual(recordList[1].text, 'world');
        database.close();

        // Test get all with count
        Test.describe('Get all with count');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'first' }, 1);
        await objectStore1.add({ text: 'second' }, 2);
        await objectStore1.add({ text: 'third' }, 3);
        await objectStore1.add({ text: 'forth' }, 4);
        await objectStore1.add({ text: 'fifth' }, 5);
        await objectStore1.add({ text: 'sixth' }, 6);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        recordList = await objectStore1.getAll(undefined, 4);
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 4);
        Test.assertEqual(recordList[0].text, 'first');
        Test.assertEqual(recordList[1].text, 'second');
        Test.assertEqual(recordList[2].text, 'third');
        Test.assertEqual(recordList[3].text, 'forth');
        database.close();
        // Get with key range
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        recordList = await objectStore1.getAll(IDBKeyRange.lowerBound(4));
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 3);
        Test.assertEqual(recordList[0].text, 'forth');
        Test.assertEqual(recordList[1].text, 'fifth');
        Test.assertEqual(recordList[2].text, 'sixth');
        database.close();
    }

    /**
     * Test get key
     */
    static async testGetKey() {
        // Test get key
        Test.describe('Get key from key');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'first' }, 1);
        await objectStore1.add({ text: 'second' }, 2);
        await objectStore1.add({ text: 'third' }, 3);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let key = await objectStore1.getKey(IDBKeyRange.lowerBound(2));
        Test.assert(key);
        Test.assertEqual(key, 2);
        database.close();
    }

    /**
     * Test get all keys
     */
    static async testGetAllKeys() {
        // Test get all
        Test.describe('Get all keys');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'hello' }, 1);
        await objectStore1.add({ text: 'world' }, 2);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let recordList = await objectStore1.getAllKeys();
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 2);
        Test.assertEqual(recordList[0], 1);
        Test.assertEqual(recordList[1], 2);
        database.close();

        // Test get all with count
        Test.describe('Get all with count');
        database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'first' }, 1);
        await objectStore1.add({ text: 'second' }, 2);
        await objectStore1.add({ text: 'third' }, 3);
        await objectStore1.add({ text: 'forth' }, 4);
        await objectStore1.add({ text: 'fifth' }, 5);
        await objectStore1.add({ text: 'sixth' }, 6);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        recordList = await objectStore1.getAllKeys(undefined, 4);
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 4);
        Test.assertEqual(recordList[0], 1);
        Test.assertEqual(recordList[1], 2);
        Test.assertEqual(recordList[2], 3);
        Test.assertEqual(recordList[3], 4);
        database.close();
        // Get with key range
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        recordList = await objectStore1.getAllKeys(IDBKeyRange.lowerBound(4));
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 3);
        Test.assertEqual(recordList[0], 4);
        Test.assertEqual(recordList[1], 5);
        Test.assertEqual(recordList[2], 6);
        database.close();
    }

    /**
     * Test open cursor.
     */
    static async testOpenCursor() {
        // Test get all
        Test.describe('Open cursor');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'first' }, 1);
        await objectStore1.add({ text: 'second' }, 2);
        await objectStore1.add({ text: 'third' }, 3);
        await objectStore1.add({ text: 'forth' }, 4);
        await objectStore1.add({ text: 'fifth' }, 5);
        await objectStore1.add({ text: 'sixth' }, 6);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let cursorWithValue = await objectStore1.openCursor();
        Test.assert(cursorWithValue);
        Test.assertEqual(cursorWithValue.value.text, 'first');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.value.text, 'second');
        database.close();
    }

    /**
     * Test open key cursor.
     */
    static async testOpenKeyCursor() {
        // Test get all
        Test.describe('Open key cursor');
        let database = new TestObjectStoreDatabase();
        Test.assert(database);
        // Add
        await database.open();
        let transaction = database.transaction('object-store1', 'readwrite');
        Test.assert(transaction);
        let objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        await objectStore1.clear();
        await objectStore1.add({ text: 'first' }, 1);
        await objectStore1.add({ text: 'second' }, 2);
        await objectStore1.add({ text: 'third' }, 3);
        await objectStore1.add({ text: 'forth' }, 4);
        await objectStore1.add({ text: 'fifth' }, 5);
        await objectStore1.add({ text: 'sixth' }, 6);
        await transaction.commit();
        database.close();
        // Get
        await database.open();
        transaction = database.transaction('object-store1');
        Test.assert(transaction);
        objectStore1 = transaction.objectStore('object-store1');
        Test.assert(objectStore1);
        let cursor = await objectStore1.openKeyCursor();
        Test.assert(cursor);
        Test.assertEqual(cursor.primaryKey, 1);
        Test.assertEqual(cursor.key, 1);
        await cursor.continue();
        Test.assertEqual(cursor.primaryKey, 2);
        Test.assertEqual(cursor.key, 2);
        database.close();
    }
}