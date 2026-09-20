# Booking and Checkout State Machine

## Booking

| State       | Allowed transitions                |
| ----------- | ---------------------------------- |
| `PENDING`   | `CONFIRMED`, `CANCELLED`           |
| `CONFIRMED` | `CANCELLED`, `ATTENDED`, `NO_SHOW` |
| `CANCELLED` | terminal                           |
| `ATTENDED`  | terminal                           |
| `NO_SHOW`   | terminal                           |

`PENDING` occupies capacity while payment is being completed. A successful
payment moves the booking to `CONFIRMED`; cancellation, checkout expiry, or a
failed payment moves it to `CANCELLED`.

## Transaction

| State       | Allowed transitions              |
| ----------- | -------------------------------- |
| `PENDING`   | `SUCCESS`, `FAILED`, `CANCELLED` |
| `SUCCESS`   | terminal                         |
| `FAILED`    | terminal                         |
| `CANCELLED` | terminal                         |

Only a transaction in `PENDING` can be fulfilled. Stripe retries therefore
become no-ops after the first successful fulfillment.

## Pass

| State       | Allowed transitions    |
| ----------- | ---------------------- |
| `ACTIVE`    | `EXPIRED`, `CANCELLED` |
| `EXPIRED`   | terminal               |
| `CANCELLED` | terminal               |

Limited credits may still be exhausted as an operational detail without
changing the purchase state machine above.
