## Setup

[Stripe CLI Install](https://docs.stripe.com/stripe-cli/install)

### Windows 11

`npm i -g @stripe/cli`

`stripe login`

`npx stripe listen --forward-to localhost:3000/api/checkout/webhook`
