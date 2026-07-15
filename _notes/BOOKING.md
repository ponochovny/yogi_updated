## Rules

### Problems / resolves

#### Abandoned booking

##### (Problem) If the user closes checkout page without proceeding, then the booking will be abandoned with status PENDING forever without cleaning up

##### (Resolve)

- Use backend timeout for 15 minutes to clean up the abandoned bookings
