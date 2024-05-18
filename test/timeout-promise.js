/**
 * Timeout promise.
 * Used to wait for for a number of milliseconds. This is helpful when you want to add
 * timeouts to other promises.
 */
export class TimeoutPromise {
    /**
     * Wait for the given amount of time.
     * @param {Number} delay The number of milliseconds to wait.
     */
    static wait(delay) {
        // Create prmoise
        const promise = new Promise((resolve, reject) => {
            // Set the timeout for the delayed amount
            const timerId = setTimeout(() => {
                // Resolve the timeout
                resolve('timeout');
            }, delay);
        });

        // Return the promise
        return promise;
    }
}