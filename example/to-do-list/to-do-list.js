/**
 * To do list web component
 */
import { Database } from "../../database.js";

// To do list database
class ToDoListDatabase extends Database {
    /**
     * To do list database constructor.
     */
    constructor() {
        // Call the base class super with the database name and its version number
        super('to-do-list-database', 1);
    }

    /**
     * Override the update function to perform the version changes.
     * @param {Transaction} transaction The transaction used to perform any adjustments.
     * @param {Number} oldVersion The old version number.
     * @param {Number} newVersion The new version number.
     */
    _upgrade(transaction, oldVersion, newVersion) {
        // Create the to-do-list object stores (table)
        this.createObjectStore('to-do-list', { keyPath: 'id', autoIncrement: true });
    }
}

// To do list web component
class ToDoList extends HTMLElement {
    /**
     * Static HTML constant.
     * @return {string} The HTML constant.
     */
    static get HTML() {
        return /*html*/`
        <h1>To Do List</h1>
        <div id="item-list"></div>
        <input id="item-input" type="text">
        <button id="add">Add</button>
        <button id="delete">Delete</button>
        `;
    }

    /**
     * To do list component constructor.
     * @constructor
     */
    constructor() {
        // Must call super first
        super();

        // Attach shadow DOM root
        this.attachShadow({mode: 'open'});

        // Set shadow DOM's inner HTML
        this.shadowRoot.innerHTML = ToDoList.HTML;

        // Get elements
        this._itemListElement = this.shadowRoot.getElementById('item-list');
        this._itemInputElement = this.shadowRoot.getElementById('item-input');
        this._addElement = this.shadowRoot.getElementById('add');
        this._deleteElement = this.shadowRoot.getElementById('delete');

        // Set event function binding to this
        this._itemClickEvent = this._itemClickEvent.bind(this);
        this._addClickEvent = this._addClickEvent.bind(this);
        this._deleteClickEvent = this._deleteClickEvent.bind(this);

        // Hide delete button
        this._deleteElement.style.display = 'none';

        // Set selected item element
        this._selectedItemElement = null;
    }

    /**
    * Override connectedCallback function to handle when component is attached into the DOM.
    * @override
    */
    connectedCallback() {
        // Add events
        this._addElement.addEventListener('click', this._addClickEvent);
        this._deleteElement.addEventListener('click', this._deleteClickEvent);

        // Refresh item list
        this._refreshItemList();
    }

    /**
     * Override disconnectedCallback function to handle when component is detached from the DOM.
     * @override
     */
    disconnectedCallback() {
        // Remove events
        this._addElement.removeEventListener('click', this._addClickEvent);
        this._deleteElement.removeEventListener('click', this._deleteClickEvent);
    }

    /**
     * Add click event.
     */
    async _addClickEvent() {
        // Get item input text
        const itemInputText = this._itemInputElement.value;

        // If nothing entered
        if (!itemInputText) return;

        // Create record
        const record = {};
        record.text = itemInputText;

        // Create database object
        const database = new ToDoListDatabase();

        // Open the database
        await database.open();

        // Open transaction (for read and write)
        const transaction = database.transaction('to-do-list', 'readwrite');

        // Open the object store (table)
        const toDoListObjectStore = transaction.objectStore('to-do-list');

        // Add object (record) the object store (table)
        await toDoListObjectStore.add(record);

        // Commit the transaction (save them)
        await transaction.commit();

        // Close database
        database.close();

        // Clear input
        this._itemInputElement.value = '';

        // Refresh item list
        this._refreshItemList();
    }

    /**
     * Delete click event.
     */
    async _deleteClickEvent() {
        // Create database object
        const database = new ToDoListDatabase();

        // Open the database
        await database.open();

        // Open transaction (for reading only)
        const transaction = database.transaction('to-do-list', 'readwrite');

        // Open the object store (table)
        const toDoListObjectStore = transaction.objectStore('to-do-list');

        // Delete the record
        await toDoListObjectStore.delete(this._selectedItemElement._record.id);

        // Commit the transaction
        await transaction.commit();

        // Close database
        database.close();

        // Refresh item list
        this._refreshItemList();
    }

    /**
     * Item click event.
     */
    _itemClickEvent(event) {
        // Get element
        const itemElement = event.target;

        // If something already selected
        if (this._selectedItemElement) {
            // If the same
            if (this._selectedItemElement._record.id === itemElement._record.id) {
                // Reset background color
                this._selectedItemElement.style.backgroundColor = 'inherit';

                // Clear selected
                this._selectedItemElement = null;

                // Hide delete button
                this._deleteElement.style.display = 'none';

                // Stop here
                return;
            }
        }

        // Set the selected element
        this._selectedItemElement = itemElement;

        // Set background color
        this._selectedItemElement.style.backgroundColor = 'lightblue';

        // Show delete button
        this._deleteElement.style.display = 'inline-block';
    }

    /**
     * Refresh the item list
     */
    async _refreshItemList() {
        // Reset selected item element
        this._selectedItemElement = null;

        // Create database object
        const database = new ToDoListDatabase();

        // Open the database
        await database.open();

        // Open transaction (for reading only)
        const transaction = database.transaction('to-do-list');

        // Open the object store (table)
        const toDoListObjectStore = transaction.objectStore('to-do-list');

        // Get all the objects (records)
        const recordList = await toDoListObjectStore.getAll();

        // Clear current to do list
        this._itemListElement.innerHTML = '';

        // For each record
        recordList.forEach((record) => {
            // Create DIV element
            const divElement = document.createElement('div');

            // Set record
            divElement._record = record;

            // Add inner text
            divElement.textContent = record.text;

            // Set styles
            divElement.style.cursor = 'pointer';
            divElement.style.userSelect = 'none';

            // Add click event
            divElement.addEventListener('click', this._itemClickEvent);

            // Add to list
            this._itemListElement.appendChild(divElement);
        });

        // Close database
        database.close();
    }
}
 
// Define controller web component
customElements.define('to-do-list', ToDoList);
