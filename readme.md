# IndexedDB Promise

```javascript
const db = await MyDatabase.open('database');
const transaction = db.transaction(['objectStore1'], 'readwrite');
const objectStore = await transaction.objectStore('objectStore1');
await objectStore.add({ name: 'hello', age: 34 }, key);
await transaction.commit();
```

## Tests

***Database***

- Upgrade from empty
- Upgrade from version 1 to 2
- Upgrade add/remove object store
- upgrade add/remove indexes

***Transaction***

- Add record.
- Add then remove record.
- Add 2 then count.

***Cursor***

- Add many records, find by key?
