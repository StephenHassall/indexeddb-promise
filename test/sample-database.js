/**
 * Sample database, derived from Database class.
 */
import { Database } from "../database.js";
import Test from "./test.js";

export class SampleDatabase extends Database {
    constructor() {
        super('sample-database', 1);
    }

    _onUpgradeNeeded() {
        Test.describe('Sample database _onUpgradeNeeded');
        Test.assertEqual(this.version, 1);
        let objectStore1 = this.createObjectStore('objectStore1');
        Test.assert(objectStore1);
        return Promise.resolve();
    }
}