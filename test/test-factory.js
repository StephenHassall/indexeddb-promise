/**
 * Test database.
 */
import { Factory } from "../factory.js";
import Tools from "./tools.js";
import Test from "./test.js";

export default class TestFactory {
    /**
     * Run all the database tests.
     */
    static async run() {
        // Set test
        Test.test('Factory');

        // Delete all the databases
        await Tools.deleteAllDatabases();

        // Perform tests
        await TestFactory.testUpgradeNeeded();
    }

    /**
     * Test upgrade needed.
     */
    static async testUpgradeNeeded() {
        // Test upgrade (from empty)
        Test.describe('Upgrade needed (from empty)');
        let database = await Factory.upgradeNeeded('upgrade-needed-from-empty', 1);
        Test.assert(database);
        database.close();

        // Test upgrade (version 1 to 2)
        Test.describe('Upgrade needed new version');
        database = await Factory.upgradeNeeded('upgrade-needed-new-version', 1);
        Test.assert(database);
        database.close();
        database = await Factory.upgradeNeeded('upgrade-needed-new-version', 2);
        Test.assert(database);
        database.close();

        // Test upgrade (same version)
        Test.describe('Upgrade needed same version');
        database = await Factory.upgradeNeeded('upgrade-needed-same-version', 1);
        Test.assert(database);
        database.close();
        database = await Factory.upgradeNeeded('upgrade-needed-same-version', 1);
        Test.assertEqual(database, undefined);
    }
}