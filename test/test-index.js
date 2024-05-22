/**
 * Test index.
 */
import { Database } from "../database.js";
import { Transaction } from "../transaction.js";
import { ObjectStore } from "../object-store.js";
import { Index } from "../index.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test index database
class TestIndexDatabase extends Database {
    constructor() {
        super('object-store', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        // Create object store and indexes
        const objectStore = this.createObjectStore('object-store', { keyPath: 'id' });
        objectStore.createIndex('index1', 'name', { unique: true });
        objectStore.createIndex('index2', 'age', { unique: false });
        objectStore.createIndex('index3', 'tags', { multiEntry: true });
    }
}

// Main testing
export default class TestIndex {
    /**
     * Run all the index tests.
     */
    static async run() {
        // Set test
        Test.test('Index');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestIndex.testCreate();
        await TestIndex.testCount();
        await TestIndex.testGet();
        await TestIndex.testGetAll();
        await TestIndex.testGetKey();
        await TestIndex.testOpenCursor();
        await TestIndex.testOpenKeyCursor();
    }

    /**
     * Test create.
     */
    static async testCreate() {
        // Test key path
        Test.describe('Key paths');
        let database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        let transaction = database.transaction('object-store');
        let objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');
        Test.assert(index1);
        Test.assertEqual(index1.keyPath, 'name');
        let index2 = objectStore.index('index2');
        Test.assert(index2);
        Test.assertEqual(index2.keyPath, 'age');
        let index3 = objectStore.index('index3');
        Test.assert(index3);
        Test.assertEqual(index3.keyPath, 'tags');
        database.close();

        // Test multi entry
        Test.describe('Multi entry');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        index1 = objectStore.index('index1');
        Test.assert(index1);
        Test.assertEqual(index1.multiEntry, false);
        index2 = objectStore.index('index2');
        Test.assert(index2);
        Test.assertEqual(index2.multiEntry, false);
        index3 = objectStore.index('index3');
        Test.assert(index3);
        Test.assertEqual(index3.multiEntry, true);
        database.close();

        // Test name
        Test.describe('Name');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        index1 = objectStore.index('index1');
        Test.assert(index1);
        Test.assertEqual(index1.name, 'index1');
        index2 = objectStore.index('index2');
        Test.assert(index2);
        Test.assertEqual(index2.name, 'index2');
        index3 = objectStore.index('index3');
        Test.assert(index3);
        Test.assertEqual(index3.name, 'index3');
        database.close();

        // Test unique
        Test.describe('Unique');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        index1 = objectStore.index('index1');
        Test.assert(index1);
        Test.assertEqual(index1.unique, true);
        index2 = objectStore.index('index2');
        Test.assert(index2);
        Test.assertEqual(index2.unique, false);
        index3 = objectStore.index('index3');
        Test.assert(index3);
        Test.assertEqual(index3.unique, false);
        database.close();
    }

    /**
     * Test count.
     */
    static async testCount() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test count all
        Test.describe('Count all');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let count = await objectStore.count();
        Test.assertEqual(count, 6);
        database.close();

        // Test count index
        Test.describe('Count index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');
        count = await index1.count();
        Test.assertEqual(count, 6);
        let index2 = objectStore.index('index2');
        count = await index2.count();
        Test.assertEqual(count, 6);
        let index3 = objectStore.index('index3');
        count = await index3.count();
        Test.assertEqual(count, 12);
        database.close();
    }

    /**
     * Test get.
     */
    static async testGet() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test get index
        Test.describe('Get index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');
        let record = await index1.get('nameB');
        Test.assert(record);
        Test.assertEqual(record.id, 2);
        let index2 = objectStore.index('index2');
        record = await index2.get(21);
        Test.assert(record);
        Test.assertEqual(record.id, 2);
        let index3 = objectStore.index('index3');
        record = await index3.get('frog');
        Test.assert(record);
        Test.assertEqual(record.id, 5);
        database.close();
    }

    /**
     * Test get all.
     */
    static async testGetAll() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test get index
        Test.describe('Get all index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');
        let recordList = await index1.getAll('nameB');
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 1);
        Test.assertEqual(recordList[0].id, 2);
        let index2 = objectStore.index('index2');
        recordList = await index2.getAll(21);
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 3);
        Test.assertEqual(recordList[0].id, 2);
        Test.assertEqual(recordList[1].id, 3);
        Test.assertEqual(recordList[2].id, 4);
        let index3 = objectStore.index('index3');
        recordList = await index3.getAll('frog');
        Test.assert(recordList);
        Test.assertEqual(recordList.length, 2);
        Test.assertEqual(recordList[0].id, 5);
        Test.assertEqual(recordList[1].id, 6);
        database.close();
    }

    /**
     * Test get key.
     */
    static async testGetKey() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test get index
        Test.describe('Get key index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');
        let key = await index1.getKey('nameB');
        Test.assert(key);
        Test.assertEqual(key, 2);
        let index2 = objectStore.index('index2');
        key = await index2.getKey(21);
        Test.assert(key);
        Test.assertEqual(key, 2);
        let index3 = objectStore.index('index3');
        key = await index3.getKey('frog');
        Test.assert(key);
        Test.assertEqual(key, 5);
        database.close();
    }

    /**
     * Test open cursor.
     */
    static async testOpenCursor() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test get index
        Test.describe('Open cursor index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');

        let cursorWithValue = await index1.openCursor();
        Test.assert(cursorWithValue);
        Test.assertEqual(cursorWithValue.value.id, 1);
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.value.id, 2);

        let index2 = objectStore.index('index2');
        cursorWithValue = await index2.openCursor();
        Test.assert(cursorWithValue);
        Test.assertEqual(cursorWithValue.value.id, 1);
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.value.id, 2);

        // Bird is first
        let index3 = objectStore.index('index3');
        cursorWithValue = await index3.openCursor();
        Test.assert(cursorWithValue);
        Test.assertEqual(cursorWithValue.value.id, 2);
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.value.id, 4);
        database.close();
    }

    /**
     * Test open key cursor.
     */
    static async testOpenKeyCursor() {
        // Test add records
        let database = new TestIndexDatabase();
        await database.open();
        let transaction = database.transaction('object-store', 'readwrite');
        let objectStore = transaction.objectStore('object-store');
        await objectStore.clear();
        await objectStore.add({ id: 1, name: 'nameA', age: 20, tags: ['cat', 'dog']});
        await objectStore.add({ id: 2, name: 'nameB', age: 21, tags: ['cat', 'fish', 'bird']});
        await objectStore.add({ id: 3, name: 'nameC', age: 21, tags: ['fish']});
        await objectStore.add({ id: 4, name: 'nameD', age: 21, tags: ['bird', 'dog']});
        await objectStore.add({ id: 5, name: 'nameE', age: 24, tags: ['frog', 'dog']});
        await objectStore.add({ id: 6, name: 'nameF', age: 25, tags: ['fish', 'frog']});
        await transaction.commit();
        database.close();

        // Test get index
        Test.describe('Open key cursor index');
        database = new TestIndexDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let index1 = objectStore.index('index1');

        let cursor = await index1.openKeyCursor();
        Test.assert(cursor);
        Test.assertEqual(cursor.primaryKey, 1);
        Test.assertEqual(cursor.key, 'nameA');
        await cursor.continue();
        Test.assertEqual(cursor.primaryKey, 2);
        Test.assertEqual(cursor.key, 'nameB');

        let index2 = objectStore.index('index2');
        cursor = await index2.openKeyCursor();
        Test.assert(cursor);
        Test.assertEqual(cursor.primaryKey, 1);
        Test.assertEqual(cursor.key, 20);
        await cursor.continue();
        Test.assertEqual(cursor.primaryKey, 2);
        Test.assertEqual(cursor.key, 21);

        // Bird is first
        let index3 = objectStore.index('index3');
        cursor = await index3.openKeyCursor();
        Test.assert(cursor);
        Test.assertEqual(cursor.primaryKey, 2);
        Test.assertEqual(cursor.key, 'bird');
        await cursor.continue();
        Test.assertEqual(cursor.primaryKey, 4);
        Test.assertEqual(cursor.key, 'bird');
        database.close();
    }
}