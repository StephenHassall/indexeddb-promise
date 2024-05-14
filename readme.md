# IndexedDB Promise

```javascript
// Upgrade database
const database = Database.upgradeCheck('database', 2);
if (!database) return;
// do upgrading process


// Elsewhere
const db = await Database.open('database');
const transaction = db.transaction(['objectStore1'], 'readwrite');
const objectStore = await transaction.objectStore('objectStore1');
await objectStore.add({ name: 'hello', age: 34 }, key);
await transaction.commit();
```