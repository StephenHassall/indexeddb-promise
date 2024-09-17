# History

## Version 1.0.0 (2024-05-25)

## Version 1.0.2 (2024-05-29)
Changed package.json so that `main` is not used, but `browser` instead.

## Version 1.0.3 (2024-09-16)
Was not handling `onblocked` events correctly. If you open a database connection that is using version 1, and then
open another connection to the same database but with version 2, then it fires the `blocked` event. When this happens we now
reject the open promise.

However, it will keep the `openDbRequest` object hanging around until the first database connect (version 1) is closed, and then it will continue
as before, calling either the `success` or `upgradeneeded` events. By the time this happens the old promise used before is now no more.

The only thing we can do at this point is to just close the old database connection.

Some extra tests have been added to make this happen and to make sure it fails correctly.

Below is an example.

```javascript
// Create the two databases (verison 1 and 2)
const database = new TestBlocked1Database();
const database2 = new TestBlocked2Database();

// Open and connect to the database (version 1)
await database.open();

try {
    // Open and connect to the database (version 2)
    await database2.open();
} catch (e) {
    // This promise will be rejected
    // e.message = 'Blocked'
}

// Close the old version 1 database
database.close();

// We can now open and connect to the version 2 database
await database2.open();

// Do some database stuf

// Close version 2 database
database2.close();
```
