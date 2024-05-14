/**
 * Test
 * Used to help with the testing process.
 */

export default class Test {
    /**
     * Error count.
     */
    static _errorCount = 0;

    /**
     * Test name of the module being tested.
     */
    static _testName;

    /**
     * Description of the test being performed.
     */
    static _description;

    /**
     * Set the current test name of the module being performed.
     * @param {String} name A name of the module.
     */
    static test(name) {
        // Set the name of the modue we are testing
        Test._testName = name;
    }

    /**
     * Set the current description of the tests being performed.
     * @param {String} description A small amount of information about the tests.
     */
    static describe(description) {
        // Set the description of the thing we are testing
        Test._description = description;
    }

    /**
     * Assert there is something (i.e. not undefined or null).
     * @param {any} value The value to check contains something.
     */
    static assert(value) {
        // If und
        if (value === undefined || value === null) {
            // Increase error count
            Test._errorCount++;

            // Log problem
            console.error(Test._testName);
            console.error(Test._description);
            console.error('assert');
            console.trace();
        }
    }

    /**
     * Assert the two values are equal.
     * @param {String|Number} value1 The first value to check with.
     * @param {String|Number} value2 The second value to check against.
     */
    static assertEqual(value1, value2) {
        // If the values are the same then we can just move on
        if (value1 === value2) return;

        // Increase error count
        Test._errorCount++;

        // Log problem
        console.error(Test._testName);
        console.error(Test._description);
        console.error('assertEqual', value1, value2);
        console.trace();
    }

    /**
     * Print a report of the testing.
     */
    static report() {
        // If no errors
        if (Test._errorCount === 0) {
            // Log all done
            console.log('All tests passed.');
            return;
        }

        // Log issues found
        console.log('Testing found issues: ' + Test._errorCount.toString());
    }
}