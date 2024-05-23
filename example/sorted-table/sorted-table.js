/**
 * Sorted table web component
 */
import { Database } from "../../database.js";

// Sorted table database
class SortedTableDatabase extends Database {
    /**
     * Sorted table database constructor.
     */
    constructor() {
        // Call the base class super with the database name and its version number
        super('sorted-table-database', 1);
    }

    /**
     * Override the update function to perform the version changes.
     * @param {Transaction} transaction The transaction used to perform any adjustments.
     * @param {Number} oldVersion The old version number.
     * @param {Number} newVersion The new version number.
     */
    async _upgrade(transaction, oldVersion, newVersion) {
        // Create the sorted table object stores (table)
        const objectStore = this.createObjectStore('sorted-table', { keyPath: 'id' });

        // Create indexes
        objectStore.createIndex('index-id', 'id');
        objectStore.createIndex('index-name', 'name');
        objectStore.createIndex('index-age', 'age');
        objectStore.createIndex('index-admin', 'admin');

        // Create sample data
        await objectStore.add({ id: 1, name: 'Stephen Hassall', age: 49, admin: true });
        await objectStore.add({ id: 2, name: 'Sue Smith', age: 23, admin: true });
        await objectStore.add({ id: 3, name: 'Bob Green', age: 37, admin: false });
        await objectStore.add({ id: 4, name: 'Peter Abbot', age: 26, admin: false });
        await objectStore.add({ id: 5, name: 'Ian Bail', age: 18, admin: false });
        await objectStore.add({ id: 6, name: 'Mary Carrow', age: 41, admin: false });
        await objectStore.add({ id: 7, name: 'Paul Coby', age: 26, admin: false });
        await objectStore.add({ id: 8, name: 'Charlotte Dawson', age: 31, admin: false });
        await objectStore.add({ id: 9, name: 'Camila Drake', age: 19, admin: false });
        await objectStore.add({ id: 10, name: 'Amelia Emmerson', age: 56, admin: false });
        await objectStore.add({ id: 11, name: 'Noah Everley', age: 63, admin: false });
        await objectStore.add({ id: 12, name: 'Arthur Fletcher', age: 51, admin: false });
        await objectStore.add({ id: 13, name: 'Jack Ford', age: 47, admin: false });
        await objectStore.add({ id: 14, name: 'Harry Hanson', age: 42, admin: false });
        await objectStore.add({ id: 15, name: 'Oliver Ivory', age: 19, admin: false });
        await objectStore.add({ id: 16, name: 'Daniel Jackson', age: 23, admin: false });
    }
}

// Sorted table web component
class SortedTable extends HTMLElement {
    /**
     * Static CSS constant.
     * @return {string} The CSS constant.
     */
    static get CSS() {
        return /*css*/`
        th, td {
            padding: 0.5rem;
            border: 1px solid lightgray;
        }
        th {
            cursor: pointer;
        }
        `;
    }

    /**
     * Static HTML constant.
     * @return {string} The HTML constant.
     */
    static get HTML() {
        return /*html*/`
        <h1>Sorted Table</h1>
        <table>
            <thead>
                <tr>
                    <th id="head-id">
                        ID
                        <span id="head-id-mark"></span>
                    </th>
                    <th id="head-name">
                        Name
                        <span id="head-name-mark"></span>
                    </th>
                    <th id="head-age">
                        Age
                        <span id="head-age-mark"></span>
                    </th>
                    <th id="head-admin">
                        Admin
                        <span id="head-admin-mark"></span>
                    </th>
                </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
        </table>
        <button id="first">First</button>
        <button id="previous">Previous</button>
        <span id="page-current"></span>
        /
        <span id="page-total"></span>
        <button id="next">Next</button>
        <button id="last">Last</button>
        `;
    }

    /**
     * Sorted table component constructor.
     * @constructor
     */
    constructor() {
        // Must call super first
        super();

        // Attach shadow DOM root
        this.attachShadow({mode: 'open'});

        // Set shadow DOM's inner HTML
        this.shadowRoot.innerHTML = SortedTable.HTML;

        // Create the CSS parts for the shadow DOM
        const style = document.createElement('style');

        // Set style
        style.textContent = SortedTable.CSS;

        // Insert shadow DOM's styles
        this.shadowRoot.prepend(style);

        // Get elements
        this._headIdElement = this.shadowRoot.getElementById('head-id');
        this._headIdMarkElement = this.shadowRoot.getElementById('head-id-mark');
        this._headNameElement = this.shadowRoot.getElementById('head-name');
        this._headNameMarkElement = this.shadowRoot.getElementById('head-name-mark');
        this._headAgeElement = this.shadowRoot.getElementById('head-age');
        this._headAgeMarkElement = this.shadowRoot.getElementById('head-age-mark');
        this._headAdminElement = this.shadowRoot.getElementById('head-admin');
        this._headAdminMarkElement = this.shadowRoot.getElementById('head-admin-mark');
        this._tableBodyElement = this.shadowRoot.getElementById('table-body');
        this._firstElement = this.shadowRoot.getElementById('first');
        this._previousElement = this.shadowRoot.getElementById('previous');
        this._nextElement = this.shadowRoot.getElementById('next');
        this._lastElement = this.shadowRoot.getElementById('last');
        this._pageCurrentElement = this.shadowRoot.getElementById('page-current');
        this._pageTotalElement = this.shadowRoot.getElementById('page-total');

        // Set event function binding to this
        this._headIdClick = this._headIdClick.bind(this);
        this._headNameClick = this._headNameClick.bind(this);
        this._headAgeClick = this._headAgeClick.bind(this);
        this._headAdminClick = this._headAdminClick.bind(this);
        this._firstClickEvent = this._firstClickEvent.bind(this);
        this._previousClickEvent = this._previousClickEvent.bind(this);
        this._nextClickEvent = this._nextClickEvent.bind(this);
        this._lastClickEvent = this._lastClickEvent.bind(this);

        // Set the current field
        this._currentField = 'id';

        // Set is ascending
        this._isAscending = true;

        // Set page parts
        this._itemsPerPage = 5;
        this._pageItemCount = 0;
        this._pageTotal = 0;
        this._pageCurrent = 0;

        // Create the database object
        this._database = new SortedTableDatabase();
    }

    /**
    * Override connectedCallback function to handle when component is attached into the DOM.
    * @override
    */
    async connectedCallback() {
        // Add events
        this._headIdElement.addEventListener('click', this._headIdClick);
        this._headNameElement.addEventListener('click', this._headNameClick);
        this._headAgeElement.addEventListener('click', this._headAgeClick);
        this._headAdminElement.addEventListener('click', this._headAdminClick);
        this._firstElement.addEventListener('click', this._firstClickEvent);
        this._previousElement.addEventListener('click', this._previousClickEvent);
        this._nextElement.addEventListener('click', this._nextClickEvent);
        this._lastElement.addEventListener('click', this._lastClickEvent);

        // Open the database
        await this._database.open();

        // Get new transaction
        const transaction = this._database.transaction('sorted-table');

        // Get object store
        const objectStore = transaction.objectStore('sorted-table');

        // Set part pages
        this._pageItemCount = await objectStore.count();

        // Set total pages
        this._pageTotal = Math.floor(((this._pageItemCount - 1) / this._itemsPerPage) + 1);
        this._pageCurrent = 0;

        // Fill the table
        await this._fillTable();

        // Set the header parts
        this._setHeader();
    }

    /**
     * Override disconnectedCallback function to handle when component is detached from the DOM.
     * @override
     */
    disconnectedCallback() {
        // Remove events
        this._headIdElement.removeEventListener('click', this._headIdClick);
        this._headNameElement.removeEventListener('click', this._headNameClick);
        this._headAgeElement.removeEventListener('click', this._headAgeClick);
        this._headAdminElement.removeEventListener('click', this._headAdminClick);
        this._firstElement.removeEventListener('click', this._firstClickEvent);
        this._previousElement.removeEventListener('click', this._previousClickEvent);
        this._nextElement.removeEventListener('click', this._nextClickEvent);
        this._lastElement.removeEventListener('click', this._lastClickEvent);

        // Close the database
        this._database.close();
    }

    /**
     * Set the table header.
     */
    _setHeader() {
        // Clear all marks
        this._headIdMarkElement.textContent = '';
        this._headNameMarkElement.textContent = '';
        this._headAgeMarkElement.textContent = '';
        this._headAdminMarkElement.textContent = '';

        // Set up down
        let direction = '(up)';
        if (this._isAscending === false) direction = '(down)';

        // Set
        switch (this._currentField) {
            case 'id': this._headIdMarkElement.textContent = direction; break;
            case 'name': this._headNameMarkElement.textContent = direction; break;
            case 'age': this._headAgeMarkElement.textContent = direction; break;
            case 'admin': this._headAdminMarkElement.textContent = direction; break;
        }
    }

    /**
     * Fill table
     */
    async _fillTable() {
        // Get new transaction
        const transaction = this._database.transaction('sorted-table');

        // Get object store
        const objectStore = transaction.objectStore('sorted-table');

        // Clear index
        let index = undefined;

        // Set the index to use
        switch (this._currentField) {
            case 'id': index = objectStore.index('index-id'); break;
            case 'name': index = objectStore.index('index-name'); break;
            case 'age': index = objectStore.index('index-age'); break;
            case 'admin': index = objectStore.index('index-admin'); break;
        }

        // Clear row items
        this._tableBodyElement.innerHTML = '';

        // Set direction
        let direction = 'next';
        if (this._isAscending === false) direction = 'prev';

        // Get starting cursor
        const cursor = await index.openCursor(undefined, direction);

        // Set cursor offset
        const cursorOffset = this._pageCurrent * this._itemsPerPage;

        // Move cursor to start of current page
        if (cursorOffset !== 0) {
            if (await cursor.advance(cursorOffset) === null) return;
        }

        // For each item in page
        for (let item = 0; item < this._itemsPerPage; item++) {
            // Create table row element
            const tableRow = document.createElement('tr');

            // Add id
            let tdElement = document.createElement('td');
            tdElement.textContent = cursor.value.id.toString();
            tableRow.appendChild(tdElement);

            // Add name
            tdElement = document.createElement('td');
            tdElement.textContent = cursor.value.name;
            tableRow.appendChild(tdElement);

            // Add age
            tdElement = document.createElement('td');
            tdElement.textContent = cursor.value.age.toString();
            tableRow.appendChild(tdElement);

            // Add admin
            tdElement = document.createElement('td');
            if (cursor.value.admin === true) tdElement.textContent = 'YES';
            if (cursor.value.admin === false) tdElement.textContent = 'NO';
            tableRow.appendChild(tdElement);

            // Add to table body
            this._tableBodyElement.appendChild(tableRow);

            // Move on to the next cursor
            if (await cursor.continue() === null) break;
        }

        // Set current page
        this._pageCurrentElement.textContent = (this._pageCurrent + 1).toString();

        // Set total page
        this._pageTotalElement.textContent = this._pageTotal.toString();
    }

    /**
     * Process a header field selected
     * @param {String} field The field to process.
     */
    _processHeader(field) {
        // If already current field
        if (this._currentField === field) {
            // Swap direction
            this._isAscending = !this._isAscending;
        } else {
            // Change current field to field
            this._currentField = field;
        }

        // Reset current page to the start
        this._pageCurrent = 0;

        // Set header
        this._setHeader();

        // Fill the table
        this._fillTable();
    }

    /**
     * Header id click event.
     */
    _headIdClick() {
        // Process id header
        this._processHeader('id');
    }

    /**
     * Header name click event.
     */
    _headNameClick() {
        // Process name header
        this._processHeader('name');
    }

    /**
     * Header age click event.
     */
    _headAgeClick() {
        // Process age header
        this._processHeader('age');
    }

    /**
     * Header admin click event.
     */
    _headAdminClick() {
        // Process admin header
        this._processHeader('admin');
    }

    /**
     * First page event.
     */
    _firstClickEvent() {
        // Set the current page to the first page
        this._pageCurrent = 0;

        // Update the table with the new page of records
        this._fillTable();
    }

    /**
     * Previous page event.
     */
    _previousClickEvent() {
        // If on the first page
        if (this,this._pageCurrent === 0) return;

        // Decrease the current page
        this._pageCurrent--;

        // Update the table with the new page of records
        this._fillTable();
    }

    /**
     * Next page event.
     */
    _nextClickEvent() {
        // If on the last page
        if (this._pageCurrent + 1 >= this._pageTotal) return;

        // Increase the current page
        this._pageCurrent++;

        // Update the table with the new page of records
        this._fillTable();
    }

    /**
     * Last page event.
     */
    _lastClickEvent() {
        // Set the current page to the last
        this._pageCurrent = this._pageTotal - 1;

        // Update the table with the new page of records
        this._fillTable();
    }
}
 
// Define controller web component
customElements.define('sorted-table', SortedTable);
