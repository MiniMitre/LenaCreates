# Stripe Checkout setup

## Remaining setup

1. In `worker/wrangler.toml`, replace `STRIPE_PUBLISHABLE_KEY` with your
   Stripe test publishable key (`pk_test_...`).
2. Set the test secret key as a Cloudflare Worker secret, then deploy the
   Worker:

   ```powershell
   npx wrangler login
   npx wrangler secret put STRIPE_SECRET_KEY --config worker/wrangler.toml
   npx wrangler deploy --config worker/wrangler.toml
   ```

   Do not add the secret key to GitHub, this repository, or browser code.
   The deployed Worker URL must remain
   `https://lenacreates-checkout.lenacreates0.workers.dev`, or update
   `CHECKOUT_API_URL` in [checkout/checkout.js](checkout/checkout.js).
3. Centrepiece is configured with the current test Price ID in
   `worker/wrangler.toml`. Confirm it is the intended one-time £5 Price. To
   enable another product, set a Wrangler variable named `PRICE_` followed by
   its product ID in uppercase (for example `PRICE_JELLYFISH_A4`), with that
   product's Stripe Price ID. Then set that product's `available` to `true`
   and its correct title, description, and price in [store.js](store.js).
4. Publish the site and Worker changes. Test in Stripe test mode using
   `4242 4242 4242 4242`, any future expiry date, and any CVC. Use a valid
   Great Britain address. Never use test card details in live mode.
5. Before going live, use matching live-mode publishable/secret keys and live
   Price IDs, then redeploy. Keep test and live Stripe configuration separate.

## What is configured

- The Centrepiece is available for £5 in the shop.
- Other sample catalogue items have product detail pages but remain marked
  “Coming soon” until their real Stripe Prices and product details are set.
- The basket stores multiple products and quantities in the browser. The Worker
  only accepts product IDs with a configured `PRICE_<PRODUCT_ID>` binding;
  it does not trust prices or Stripe Price IDs sent by the browser.
- The Worker creates one Stripe-hosted Checkout Session with a line item for
  each configured product, including its selected quantity.
- The Worker collects a billing address and a GB shipping address. Shipping
  charges are not configured yet, so set up Stripe shipping rates before
  relying on the checkout total for postage.

## Flow

Shop cards open [product/index.html](product/index.html) with the selected
product ID. The product page adds eligible products to the basket stored in
`localStorage`. [checkout/index.html](checkout/index.html) lists the basket and
lets the customer adjust quantities. It sends product IDs and quantities to
the Cloudflare Worker, which resolves configured Stripe Price IDs and
redirects to Stripe-hosted Checkout.

## Project files

- [store.js](store.js) — product catalogue and browser shopping basket.
- [shop/shop.js](shop/shop.js) — renders clickable shop cards.
- [product/product.js](product/product.js) — product detail and add-to-basket.
- [checkout/checkout.js](checkout/checkout.js) — basket management and Stripe redirect.
- [worker/src/index.js](worker/src/index.js) — validates cart and creates the
  Stripe Checkout Session.
- [worker/wrangler.toml](worker/wrangler.toml) — Worker settings and public
  Stripe Price IDs.

## Before accepting live orders

Configure shipping rates, verify that Checkout success reflects actual payment,
and implement order fulfillment through a verified Stripe webhook. The success
page alone does not verify a payment or fulfill an order.

Resources: [Stripe support](https://support.stripe.com) and
[Stripe documentation](https://docs.stripe.com/mcp).
