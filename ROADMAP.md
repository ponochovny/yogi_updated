## Release notes

### Jun 20 2026 - v0.0.2-alpha

- Offering creation
- Slots creation with generator
- Booking cancel
- Booking status change by manager/practitioner (attended/no show)
- Public with studios & offerings
- Public offering page with slots for booking

### Jun 05 2026 - v0.0.1-alpha

- Authentication
- User Roles
- Auth Middleware
- User dashboard
- User Settings
- Main Dashboard
- Studio Creation
- Media upload
- Locations creation

## Main stack

### Media

- ✅ Cloudinary upload to media table

### Auth / DB

- ✅ Auth
- ✅ User roles
- ✅ Auth middleware

#### Other

- [ ] Change to Neon Auth
- [ ] User role robust

### User dashboard

- ✅ UI, Layout
- ✅ Profile settings
- [ ] Email verification
- ✅ Reset password
- [ ] Google Authentication

### Main Dashboard

- ✅ Main Dashboard
- ✅ Main Dashboard with studios list
- ✅ Main Dashboard with practitioners list

### Studio

- ✅ Studio creation
- [ ] Studio edit
- ✅ Studio offerings
- [ ] Studio memberships
- [ ] Studio causes
- [ ] Studio promocodes

### Practitioner

- ✅ Practitioner creation

### Offerings

- ✅ Offering creation
- ✅ Offering edit
- [ ] Offering duplicate
- ✅ Offering with booking slots

### Memberships

- [ ] Membership creation
- [ ] Membership edit / duplicate

### Causes

- [ ] Cause creation
- [ ] Cause edit / duplicate

### Promo codes

- [ ] Promo code creation
- [ ] Promo code edit / duplicate

### Bookings

- ✅ Bookings table & migrations
- ✅ Booking API endpoint
- ✅ User bookings profile page
- ✅ Cancel booking
- [ ] Allow cancel but not in last hour
- [ ] Cancel booking with refund
