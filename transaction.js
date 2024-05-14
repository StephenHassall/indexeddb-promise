/**
 * Indexed DB promise transaction.
 */

export class Transaction {
    constructor(iDbTransaction) {
        this._iDbTransaction = iDbTransaction;
    }

    commit() {
        const promise = new Promise((resolve, reject) => {
            this._iDbTransaction.commit();

            this._iDbTransaction.onerror = (event) => {
                reject(event);
            };

            this._iDbTransaction.onsuccess = (event) => {
                resolve();
            };
        });

        return promise;
    }
}