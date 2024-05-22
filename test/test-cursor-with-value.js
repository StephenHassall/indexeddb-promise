/**
 * Test cursor with value.
 */
import { Database } from "../database.js";
import { Transaction } from "../transaction.js";
import { ObjectStore } from "../object-store.js";
import { Index } from "../index.js";
import { CursorWithValue } from "../cursor-with-value.js";
import Tools from "./tools.js";
import Test from "./test.js";

// Test cursor with value database
class TestCursorWithValueDatabase extends Database {
    constructor() {
        super('object-store', 1);
    }

    _upgrade(transaction, oldVersion, newVersion) {
        // Create object store and indexes
        const objectStore = this.createObjectStore('object-store', { keyPath: 'id' });
        objectStore.createIndex('indexTags', 'tags', { multiEntry: true });
    }
}

// Main testing
export default class TestCursorWithValue {
    /**
     * Run all the cursor with value tests.
     */
    static async run() {
        // Set test
        Test.test('CursorWithValue');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestCursorWithValue.testCreate();
        await TestCursorWithValue.testPrimaryKey();
        await TestCursorWithValue.testAdvance();
        await TestCursorWithValue.testContine();
        await TestCursorWithValue.testContinePrimaryKey();
        await TestCursorWithValue.testUpdate();
        await TestCursorWithValue.testDelete();
    }

    /**
     * Test create.
     */
    static async testCreate() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test direction not set
        Test.describe('Direction not set');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let cursorWithValue = await objectStore.openCursor();
        Test.assertEqual(cursorWithValue.direction, 'next');
        database.close();

        // Test direction previous
        Test.describe('Direction previous');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        cursorWithValue = await objectStore.openCursor(undefined, 'prev');
        Test.assertEqual(cursorWithValue.direction, 'prev');
        database.close();

        // Test source
        Test.describe('Source');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        cursorWithValue = await objectStore.openCursor();
        if (!(cursorWithValue.source instanceof IDBObjectStore)) Test.assert();
        let indexTags = objectStore.index('indexTags');
        cursorWithValue = await indexTags.openCursor();
        if (!(cursorWithValue.source instanceof IDBIndex)) Test.assert();
        database.close();
    }

    /**
     * Test primary key.
     */
    static async testPrimaryKey() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test primary key
        Test.describe('Primary key');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let indexTags = objectStore.index('indexTags');
        let cursorWithValue = await indexTags.openCursor();
        // Order bird, cat, dog, fish, frog
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.primaryKey, 1);
        Test.assertEqual(cursorWithValue.key, 'cat');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'cat');
        database.close();
    }

    /**
     * Test advance.
     */
    static async testAdvance() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test advance
        Test.describe('Advance');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let indexTags = objectStore.index('indexTags');
        let cursorWithValue = await indexTags.openCursor();
        // Order bird, cat, dog, fish, frog
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.advance(2);
        // id 2, cat
        Test.assertEqual(cursorWithValue.primaryKey, 1);
        Test.assertEqual(cursorWithValue.key, 'cat');
        await cursorWithValue.advance(3);
        // id 2, cat
        // id 1, dog
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'dog');
        database.close();
    }
    
    /**
     * Test continue.
     */
    static async testContine() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test continue
        Test.describe('Continue');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let cursorWithValue = await objectStore.openCursor();
        Test.assertEqual(cursorWithValue.key, 1);
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.key, 2);
        await cursorWithValue.continue(5);
        Test.assertEqual(cursorWithValue.key, 5);
        database.close();
    }

    /**
     * Test continue primary key.
     */
    static async testContinePrimaryKey() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test continue
        Test.describe('Continue');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store');
        objectStore = transaction.objectStore('object-store');
        let indexTags = objectStore.index('indexTags');
        let cursorWithValue = await indexTags.openCursor();
        // Order bird, cat, dog, fish, frog
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.continuePrimaryKey('dog', 4);
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'dog');
        database.close();
    }

    /**
     * Test update.
     */
    static async testUpdate() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test continue
        Test.describe('Continue');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store', 'readwrite');
        objectStore = transaction.objectStore('object-store');
        let indexTags = objectStore.index('indexTags');
        let cursorWithValue = await indexTags.openCursor();
        // Order bird, cat, dog, fish, frog
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.update({ id: 4, name: 'nameUpdate', age: 64, tags: ['duck', 'cow']});
        // Current cursor has not changes, but record it linked to has
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'bird');
        database.close();
    }

    /**
     * Test delete.
     */
    static async testDelete() {
        // Test add records
        let database = new TestCursorWithValueDatabase();
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

        // Test continue
        Test.describe('Continue');
        database = new TestCursorWithValueDatabase();
        Test.assert(database);
        await database.open();
        transaction = database.transaction('object-store', 'readwrite');
        objectStore = transaction.objectStore('object-store');
        let indexTags = objectStore.index('indexTags');
        let cursorWithValue = await indexTags.openCursor();
        // Order bird, cat, dog, fish, frog
        Test.assertEqual(cursorWithValue.primaryKey, 2);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.continue();
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'bird');
        await cursorWithValue.delete();
        // Current cursor has not changes, but record it linked not longer exists
        Test.assertEqual(cursorWithValue.primaryKey, 4);
        Test.assertEqual(cursorWithValue.key, 'bird');
        database.close();
    }
}