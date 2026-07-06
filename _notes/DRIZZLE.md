## Transactions

Transactions in [Drizzle ORM](https://orm.drizzle.team/) ensure that a series of database operations execute as a single unit—either succeeding completely or rolling back entirely if an error occurs.

To use them, you call the `.transaction()` method on your database instance and perform your queries using the provided transaction client (tx).

### Basic Example

Drizzle automatically rolls back the transaction if any error is thrown inside the callback.

```TS
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, accounts } from './schema';

await db.transaction(async (tx) => {
  // Withdraw money
  await tx.update(accounts)
    .set({ balance: 100 })
    .where(eq(accounts.userId, 1));

  // Deposit money
  await tx.update(accounts)
    .set({ balance: 200 })
    .where(eq(accounts.userId, 2));
}); // Commits if successful, rolls back if an error is thrown
```

### Manual Rollbacks

If you need to trigger a rollback conditionally without throwing an unexpected error, you can use `tx.rollback()`.

```TS
await db.transaction(async (tx) => {
  const [newAccount] = await tx.insert(accounts).values({ userId: 3, balance: 50 });

  if (newAccount.balance < 0) {
    tx.rollback(); // Explicitly rolls back the transaction
  }
});
```

### Nested Transactions (Savepoints)

Drizzle natively supports nested transactions using savepoints, allowing you to isolate certain operations within a larger transaction

```TS
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'Dan' });

  // This nested block acts as a savepoint
  await tx.transaction(async (tx2) => {
    await tx2.insert(accounts).values({ userId: 1, balance: 0 });
  });
});
```

For tips on how to handle database connections and transactions safely within a broader ecosystem, such as wrapping them inside functional Effect applications:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/8u3vetGUtMo/0.jpg)](https://www.youtube.com/watch?v=8u3vetGUtMo)

## Prevent Race Conditions

In Drizzle ORM, `.for('update')` is used inside a transaction to append the SQL `FOR UPDATE` clause to a `SELECT` query. This locks the selected rows, preventing other concurrent transactions from reading or modifying those specific records until your transaction is committed or rolled back.

You need this to prevent race conditions during read-modify-write operations.

Consider a checkout system where two users try to buy the last item at the exact same time:

1. **Without locking:** User A reads the stock (1 left) and User B reads the stock (1 left) at the exact same time. Both process a purchase, causing the stock to drop to -1.
2. **With `.for('update')`:** User A queries the row and locks it. User B's transaction is forced to pause (wait) until User A completes the update. When User B finally gets access, the stock correctly shows 0, preventing the double-sale.

### Common Example (Counter Increment)

```TS
await db.transaction(async (tx) => {
  // Lock the row so no other transaction can read/write it right now
  const row = await tx.select()
    .from(counters)
    .where(eq(counters.id, 1))
    .for('update'); // <--- The lock happens here

  // Perform calculations safely
  const newCount = row[0].count + 1;

  // Safely update the row
  await tx.update(counters)
    .set({ count: newCount })
    .where(eq(counters.id, 1));
}); // Lock is released here when the transaction commits

```

## Types

```TS
import { bookings } from '~~/server/db/schema/booking' // <-- Drizzle Schema
typeof bookings.$inferSelect // <-- Type of schema. Schema converted into type
```
