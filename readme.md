# IndexedDB Promise

> **Important:** This is an ESM only package. It uses the browser’s IndexedDB API.

You can find tests and example code on the GitHub repository that will help you understand how to use this package. [github.com/StephenHassall/indexeddb-promise](https://github.com/StephenHassall/indexeddb-promise)

> **Important:** Most of the functions return a `Promise` object and need to be used with the `await` keyword. Not doing this will create errors. If you do have problems using the package then the first thing you need to do is double check any missing `await` statements.

## Installation

```
npm install @coderundebug/indexeddb-promise
```

## Contents

- [Introduction](#introduction)
- [Database](#database)
- [Transaction](#transaction)
- [ObjectStore](#objectstore)
- [Index](#index)
- [Cursor](#cursor)
- [CursorWithValue](#cursorwithvalue)
- [Factory](#factory)

## Introduction

The IndexedDB API is a database in the browser, however it is not the same as a large SQL like database, but more like a simple object store with indexes. It is different compared to other databases you may have used before, but once you understand how to use it, you will find it very useful for storing data on the client end.

All the API tasks are performed on a different thread and any request to do something is performed on that thread. Once the task is performed it sends an event to signal that it has finished (or failed). When doing a number of tasks together, adding and removing records, dealing with the events can become a pain. This package was created to add promises to the tasks, allowing you to use async/await to perform the steps one after the other.

```javascript
// Create instance of my database
const myDatabase = new MyDatabase();

// Open the database
await myDatabase.open();

// Create transaction
const transaction = myDatabase.transaction('my-object-store', 'readwrite');

// Open my object store (table)
const myObjectStore = transaction.objectStore('my-object-store');

// Add record (object/document)
await myObjectStore.add({ id: 1, text: 'hello' });
await myObjectStore.add({ id: 2, text: 'world' });

// Commit changes
await transaction.commit();

// Close my database
myDatabase.close();
```
All the classes are wrappers to the IDB interfaces but with promises and one or two extra helpful functions. The goal of this package is to make using the IndexedDB API easier, more understandable, but without replacing the core functions with something totally new.

You will find information on how most of the functions work by looking at the related interface functions associated with them. Their functions and parameters are basically the same.

## Database

This class is a wrapper to the `IDBDatabase` interface, but you cannot use it directly, it needs to be derived from. You create your own class that extends from the `Database` class and then override the `_upgrade` function. This is used to create the internal object stores and indexes.

```javascript
class MyDatabase extends Database {
  constructor() {
    // Call base constructor to set database name and version
    super('my-database', 1);
  }

  _upgrade(transaction, oldVersion, newVersion) {
    // New version (or first time)
    this.createObjectStore('objectStore1');
    this.createObjectStore('objectStore2');
  }
}
```

|Name|Information|
|---|---|
|**constructor**(*name*, *version*)|When you have derived your own class from `Database`, make sure you call the `super` function with the name of the database and its current version.|
|**iDbDatabase**|Get the `IDBDatabase` interface object associated with the database.|
|**version**|Get the version of the database.|
|**name**|Get the name of the database.|
|**objectStoreNames**|Get a list of object store names contained within the database.|
|**open**<br>`async/await`|Opens the database and calls the `_upgrade` override function if required.|
|**close**|Closes the database.|
|**createObjectStore**(*name*, [*options*])|While upgrading you can create new object stores.|
|**deleteObjectStore**(*name*)|While upgrading you can delete existing object stores.|
|**transaction**(*storeNames*, [*mode*], [*options*])|When the database is open you can create a transaction.|
|**_upgrade**(*transaction*, *oldVersion*, *newVersion*)|When the open function is called, if there is a different version number, then the `_upgrade` function will be called. You need to override this function within your own class and perform any upgrading steps required. You can use `async` with this function if required.|
|**_close**|Override this function to handle when the database is closed unexpectedly. This is not called when the `close` function is used. |
|**_versionChange**|Override this function to handle when the database has changed from elsewhere, in another tab for example.|

## Transaction

This class is a wrapper to the `IDBTransaction` interface.

|Name|Information|
|---|---|
|**iDbTransaction**|Get the `IDBTransaction` interface object associated with the transaction.|
|**db**|Get the `IDBDatabase` interface object that created the transaction object.|
|**durability**|Get the `durability` setting used when the transaction was created.|
|**mode**|Get the `mode` setting used when the transaction was created.|
|**objectStoreNames**|Get the list of object store names used when the transaction was created.|
|**error**|Get the error why the transaction failed.|
|**commit**<br>`async/await`|Commits any changes made with the transaction to the database.|
|**abort**<br>`async/await`|Aborts all the changes made with the transaction.|
|**objectStore**(*name*)|Get the object store object. It can only return an object store that was selected when the transaction was created.|

## ObjectStore

This class is a wrapper to the `IDBObjectStore` interface.

|Name|Information|
|---|---|
|**iDbObjectStore**|Get the `IDBObjectStore` interface object associated with the object store.|
|**transaction**|Get the `IDBTransaction` interface object that created the object store object.|
|**autoIncrement**|Get the `autoIncrement` setting used when the objectStore was created (in the `_upgrade` override function).|
|**keyPath**|Get the `keyPath` setting used when the objectStore was created (in the `_upgrade` override function).|
|**name**|Get the name of the object store.|
|**indexNames**|Get a list of all the index names within the object store.|
|**clear**()<br>`async/await`|Deletes all the objects (records) within the object store.|
|**count**([*query*])<br>`async/await`|Counts the number of objects (records) that match the query.|
|**add**(*value*, [*key*])<br>`async/await`|Insert a new object (record) into the object store.|
|**put**(*value*, [*key*])<br>`async/await`|Updates an existing object (record) within the object store.|
|**delete**(*key*)<br>`async/await`|Delete one or more objects (records) from the object store.|
|**get**(*key*)<br>`async/await`|Get the first found object (record) using the key or key range.|
|**getAll**([*query*], [*count*])<br>`async/await`|Get all the found objects (records) using the key or key range. It will only return up to the given count.|
|**getKey**([*key*])<br>`async/await`|Get the first found key using the key or key range.|
|**getAllKeys**([*query*], [*count*])<br>`async/await`|Get all the found keys using the query. It will only return up to the given count.|
|**createIndex**(*indexName*, *keyPath*, [*options*])|Create a new index for the object store to use (in the `_upgrade` override function).|
|**deleteIndex**(*indexName*)|Delete an existing index from the object store (in the `_upgrade` override function).|
|**index**(*name*)|Get the index object used by the object store.|
|**openCursor**([*query*], [*direction*])<br>`async/await`|Opens a cursor that is used to move through the matching objects (records).|
|**openKeyCursor**([*query*], [*direction*])<br>`async/await`|Opens a cursor that is used to move through the matching objects (records) and return only the key parts (not the whole object).|

## Index

This class is a wrapper to the `IDBIndex` interface.

|Name|Information|
|---|---|
|**iDbIndex**|Get the `IDBIndex` interface object associated with the index.|
|**objectStore**|Get the `IDBObjectStore` interface object that created the index object.|
|**keyPath**|Get the `keyPath` setting used when the index was created (in the `_upgrade` override function).|
|**multiEntry**|Get the `multiEntry` setting used when the index was created (in the `_upgrade` override function).|
|**unique**|Get the `unique` setting used when the index was created (in the `_upgrade` override function).|
|**name**|Get the name of the index.|
|**count**([*key*])<br>`async/await`|Counts the number of objects (records) that match the query.|
|**get**(*key*)<br>`async/await`|Get the first found object (record) using the key or key range.|
|**getAll**([*query*], [*count*])<br>`async/await`|Get all the found objects (records) using the key or key range. It will only return up to the given count.|
|**getKey**([*key*])<br>`async/await`|Get the first found key using the key or key range.|
|**getAllKeys**([*query*], [*count*])<br>`async/await`|Get all the found keys using the query. It will only return up to the given count.|
|**openCursor**([*range*], [*direction*])<br>`async/await`|Opens a cursor that is used to move through the matching objects (records).|
|**openKeyCursor**([*range*], [*direction*])<br>`async/await`|Opens a cursor that is used to move through the matching objects (records) and return only the key parts (not the whole object).|

## Cursor

This class is a wrapper to the `IDBCursor` interface.

|Name|Information|
|---|---|
|**iDbCursor**|Get the `IDBCursor` interface object associated with the cursor.|
|**source**|Get either the `IDBObjectStore` or `IDBIndex` interface object that created the cursor object.|
|**request**|Get the `IDBRequest` interface object linked to the cursor.|
|**direction**|Get the `direction` setting used when creating the cursor object.|
|**key**|Get the current key value of the object the cursor is looking at.|
|**primaryKey**|Get the current primary key value for the object the cursor is looking at.|
|**advance**(*count*)<br>`async/await`|Make the cursor jump forward by the given number of steps. The promise resolves with `true`, record found, or `false` (passed end of list).|
|**continue**([*key*])<br>`async/await`|More on to the next object (record). The promise resolves with `true`, record found, or `false` (passed end of list).|
|**continuePrimaryKey**(*key*, *primaryKey*)<br>`async/await`|More on to the next object (record). The promise resolves with `true`, record found, or `false` (passed end of list).|

## CursorWithValue

This class is a wrapper to the `IDBCursorWithValue` interface. This is derived from the `Cursor` class therefore it also contains all the properties and functions from that class.

|Name|Information|
|---|---|
|**iDbCursorWithValue**|Get the `IDBCursorWithValue` interface object associated with the cursor.|
|**value**|Get the current value, the object (record) itself, where the cursor is positioned at.|
|**delete()**<br>`async/await`|Deletes the object (record) the cursor is currently positioned at.|
|**update**(*value*)<br>`async/await`|Updates the object (record) the cursor is currently positioned at. This replaces the whole object with the existing one. Any indexes will automatically be updated.|

## Factory

This is not a wrapper like the other classes. It is used to add promises to one of the `IDBFactor` functions.

|Name|Information|
|---|---|
|**databases**|Get a list of all the databases. This information includes the name and version.|
|**deleteDatabase**(*name*, [*options*])<br>`async/await`|Deletes a database.|
