# IndexedDB Promise

```javascript
const db = await MyDatabase.open('database');
const transaction = db.transaction(['objectStore1'], 'readwrite');
const objectStore = await transaction.objectStore('objectStore1');
await objectStore.add({ name: 'hello', age: 34 }, key);
await transaction.commit();
```
