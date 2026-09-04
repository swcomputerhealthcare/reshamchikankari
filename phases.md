# RESHAM CHIKANKARI
# PHASE 14 + PHASE 15
# WISHLIST + CHECKOUT SYSTEM

---

# 00 — OBJECTIVE

Implement the complete Wishlist and Checkout experience for the
Resham Chikankari ecommerce website.

This is a PRODUCTION-FACING commerce flow.

Do not treat this as a UI-only task.

Everything must work end-to-end:

PRODUCT
→ WISHLIST
→ BAG
→ CHECKOUT
→ ADDRESS
→ ORDER SUMMARY
→ SHIPPING
→ PAYMENT
→ ORDER RESULT
→ ORDER CONFIRMATION

The implementation must preserve the existing Resham Chikankari
editorial design language.

The site should NOT suddenly look like WooCommerce, Shopify,
Razorpay's default checkout, or a generic ecommerce template.

---

# 01 — EXISTING STACK

Respect the existing project architecture.

Current expected stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Existing authentication
- Existing cart/bag system
- Existing product/catalog system
- Existing wishlist direction
- Existing payment integration if already configured

IMPORTANT:

Before implementing anything, inspect the existing codebase.

Do NOT create duplicate:

- auth systems
- cart systems
- product stores
- database clients
- Supabase clients
- checkout logic
- API routes
- state management

Reuse the existing architecture wherever possible.

---

# 02 — CORE PRINCIPLE

The implementation must separate:

UI STATE
from
PERSISTED COMMERCE STATE.

For example:

A wishlist heart animation is UI state.

Whether the product is actually in the user's wishlist is persisted state.

Likewise:

Quantity animation = UI.

Cart quantity = commerce state.

Payment animation = UI.

Payment status = server-verified commerce state.

Never trust client-only state for:

- prices
- inventory
- order totals
- payment status
- discount values
- shipping charges

---

# 03 — PHASE 14
# WISHLIST

Implement a complete wishlist system.

The wishlist must support:

- Add product
- Remove product
- Persistence
- Authentication synchronization
- Empty state
- Move item to Bag
- Product availability handling
- Mobile layout

---

# 04 — WISHLIST UX

The wishlist should feel like a curated collection rather than an
ordinary ecommerce list.

The visual language should remain:

- minimal
- editorial
- premium
- spacious
- quiet
- craft-focused

Do NOT use:

- giant red hearts
- emoji hearts
- generic Bootstrap cards
- excessive borders
- excessive shadows
- huge "ADD TO CART" buttons
- crowded product rows

Use the existing icon system.

If an icon library already exists, reuse it.

Do NOT use emojis for:

- wishlist
- bag
- delete
- account
- checkout
- success
- errors

---

# 05 — WISHLIST PRODUCT CARD

Every wishlist item should contain:

- Product image
- Product name
- Product fabric
- Product price
- Availability
- Wishlist remove action
- Move to Bag action

Optional:

- Compare-at price
- Discount indicator
- Product variant information

Do not duplicate unnecessary product metadata.

The image must preserve the existing product-image rules:

- no forced cropping
- no distorted images
- preserve product proportions
- maintain existing aesthetic

---

# 06 — WISHLIST ADD ACTION

The heart/icon on:

- product cards
- product detail page
- related products

must all use the SAME wishlist logic.

Do NOT create three independent wishlist implementations.

One shared action:

toggleWishlist(productId)

should be used wherever appropriate.

States:

NOT SAVED
↓
SAVED

and:

SAVED
↓
REMOVED

The interaction should have a subtle animation.

Do not use an excessive bounce.

---

# 07 — OPTIMISTIC WISHLIST UX

When the user taps wishlist:

UI should update immediately.

Example:

User taps heart
↓
icon changes immediately
↓
server/database request runs
↓
success
↓
persist state

If the request fails:

rollback UI state
+
show a subtle error message.

Do NOT make the user wait for a round trip before seeing the
wishlist state.

---

# 08 — AUTHENTICATION BEHAVIOR

Wishlist must integrate with the existing Supabase authentication.

There should be ONE source of truth for the logged-in user.

When logged out:

The user can either:

A. be prompted to sign in when attempting to save

OR

B. use a local temporary wishlist that synchronizes after login.

Choose the approach already consistent with the existing application.

Do NOT introduce a second authentication mechanism.

---

# 09 — WISHLIST DATABASE

If wishlist persistence is server-side, create/use a table equivalent to:

wishlist_items

Fields should conceptually include:

- id
- user_id
- product_id
- created_at

If variants are relevant to the existing product architecture,
support the appropriate variant identifier.

Constraints:

UNIQUE(user_id, product_id)

or equivalent.

A user must never be able to create duplicate wishlist entries.

---

# 10 — ROW-LEVEL SECURITY

If using Supabase:

Users must only be able to access their own wishlist.

Policy concept:

user_id = authenticated user ID

Never expose another user's wishlist through the client.

Do not rely solely on frontend filtering.

Database-level security is required.

---

# 11 — WISHLIST AUTH SYNCHRONIZATION

When a user logs in:

1. Load persisted wishlist.
2. Load any temporary/local wishlist if implemented.
3. Resolve duplicates.
4. Merge safely.
5. Persist the final state.
6. Update UI.

When user logs out:

- clear authenticated wishlist state
- do not expose private persisted data
- maintain local state only if the chosen UX supports it

When user logs back in:

- retrieve server wishlist again.

---

# 12 — MOVE WISHLIST ITEM → BAG

Every available wishlist item should have:

MOVE TO BAG

When clicked:

wishlist item
↓
validate product
↓
validate availability
↓
validate required variant/size
↓
add to bag
↓
remove from wishlist

IMPORTANT:

Do not remove the item from wishlist until the bag addition succeeds.

Correct:

Wishlist
↓
Add to Bag request
↓
SUCCESS
↓
Remove wishlist item

If adding fails:

Wishlist remains untouched.

---

# 13 — SIZE / VARIANT HANDLING

If a product requires a size before adding to bag:

Do NOT silently add an arbitrary size.

Instead:

Move to Bag
↓
size/variant selector
↓
user chooses
↓
add to bag

For unavailable variants:

Clearly indicate:

SOLD OUT

or:

UNAVAILABLE

Do not allow checkout of unavailable inventory.

---

# 14 — WISHLIST EMPTY STATE

Create a premium editorial empty state.

Do NOT use:

"Oops! Your wishlist is empty 😭"

Do NOT use emojis.

Example direction:

YOUR EDIT

Nothing saved yet.

Discover pieces crafted by hand.

[ EXPLORE COLLECTION ]

Use the site's existing typography and color system.

Keep the composition spacious.

---

# 15 — WISHLIST MOBILE

Mobile-first implementation.

At approximately:

375px
390px
430px

verify:

- product image
- product information
- price
- remove action
- move to bag
- spacing
- touch target size

No horizontal overflow.

Do not make desktop cards simply shrink.

Create a deliberate mobile composition.

---

# 16 — PHASE 15
# CHECKOUT

Build a complete checkout flow.

Required:

- Address
- Pincode
- Phone
- Email
- Order summary
- Shipping
- Payment
- Order confirmation
- Failure state
- Retry
- Mobile checkout
- Form validation

---

# 17 — CHECKOUT ENTRY

Users can enter checkout from:

BAG
↓
CHECKOUT

Before displaying checkout:

validate the bag.

Check:

- product still exists
- product active
- selected variant exists
- selected variant available
- quantity valid
- current price
- applicable discount
- shipping eligibility

Do not trust stale client-side cart data.

---

# 18 — CHECKOUT PAGE STRUCTURE

Desktop:

LEFT:

Customer information
Address
Shipping

RIGHT:

Order summary

Example hierarchy:

CHECKOUT

CONTACT
Email
Phone

DELIVERY
Name
Address
City
State
Pincode

SHIPPING
Available shipping option

ORDER
Products
Quantity
Price
Shipping
Total

PAYMENT

[ payment method ]

[ PLACE ORDER ]

The design should remain editorial and spacious.

---

# 19 — CONTACT INFORMATION

Required:

Email
Phone

Validate:

Email format
Indian phone format where applicable

Do not allow obviously invalid data.

Do not rely only on HTML validation.

Validate on:

client
AND
server

---

# 20 — SHIPPING ADDRESS

Fields:

Full name
Address line 1
Address line 2
City
State
Pincode
Phone

Do not make unnecessary fields mandatory.

Use appropriate labels.

Avoid placeholder-only forms.

Labels must remain understandable after typing.

---

# 21 — PINCODE

For Indian checkout:

validate six-digit pincode.

Example:

411001

Reject:

123
ABC123
1234567

If the project has a shipping-service API:

use it to validate serviceability.

If no shipping API exists yet:

implement a clean serviceability abstraction so it can be
connected later.

Do NOT hardcode fake shipping availability throughout the UI.

---

# 22 — SHIPPING CALCULATION

Shipping cost must NOT be calculated purely from frontend values.

Flow:

checkout request
↓
server validates address
↓
server calculates shipping
↓
server returns shipping amount
↓
client displays result

If shipping is currently free:

represent that as an explicit business rule.

Do not hardcode:

shipping = 0

throughout multiple components.

Create one source of truth.

---

# 23 — ORDER SUMMARY

Order summary must show:

Product image
Product name
Variant/size
Quantity
Unit price
Subtotal
Discount if applicable
Shipping
Final total

Do not display unnecessary metadata.

On mobile, allow a compact expandable order summary.

Example:

ORDER SUMMARY
₹2,499
⌄

Tap:

Products
Subtotal
Shipping
Discount
Total

---

# 24 — PRICE SECURITY

CRITICAL:

Never trust:

price
discount
shipping
total

from the client.

Client may submit:

product IDs
variant IDs
quantities
coupon code

Server must calculate:

current price
subtotal
discount
shipping
final amount

The payment amount must originate from server-side calculation.

---

# 25 — ORDER CREATION

Do NOT create a completed order simply because the user clicked
"Place Order".

Correct lifecycle:

CHECKOUT
↓
SERVER VALIDATES CART
↓
CREATE PENDING ORDER
↓
CREATE PAYMENT
↓
USER COMPLETES PAYMENT
↓
PAYMENT VERIFIED SERVER-SIDE
↓
ORDER = PAID / CONFIRMED

If payment fails:

ORDER = PAYMENT_FAILED

If payment is abandoned:

ORDER remains pending according to the chosen expiration policy.

---

# 26 — ORDER DATABASE

Use the existing database architecture.

Conceptual entities:

orders

order_items

payments

addresses

Do not create duplicate schemas if equivalent tables already exist.

An order should retain a snapshot of important commerce data.

For example:

product name
product identifier
variant
price at purchase
quantity
discount
shipping
total

Do not depend on the current product record to reconstruct historical
orders.

Products may change later.

---

# 27 — PAYMENT

Use the existing configured payment provider if one already exists.

Do NOT replace the existing payment system unless necessary.

Payment flow:

CLIENT
↓
request checkout
↓
SERVER
↓
validate order
↓
create payment/order
↓
PAYMENT PROVIDER
↓
USER PAYMENT
↓
SERVER VERIFICATION
↓
ORDER CONFIRMED

Never mark an order as paid based solely on:

frontend callback
URL parameter
client-side state
success screen

Payment must be verified server-side.

---

# 28 — PAYMENT SUCCESS

After successful server verification:

- mark payment successful
- mark order confirmed/paid
- finalize inventory changes
- clear purchased cart items
- preserve order record
- generate order reference
- redirect/display confirmation

Do NOT clear the bag before payment succeeds.

---

# 29 — PAYMENT FAILURE

Create a dedicated failure state.

Example:

PAYMENT COULD NOT BE COMPLETED

Your order has not been confirmed.

[ TRY AGAIN ]

[ RETURN TO BAG ]

Do NOT make the user wonder whether money was deducted.

If payment status is uncertain:

display a neutral verification state rather than falsely saying
"payment failed".

---

# 30 — RETRY PAYMENT

Retry should reuse the existing pending order where appropriate.

Do not create unlimited duplicate orders every time the user presses
Retry.

Prevent duplicate payment attempts where the payment provider supports
idempotency.

---

# 31 — ORDER CONFIRMATION

Successful order screen:

ORDER CONFIRMED

Thank you for choosing Resham Chikankari.

Order:
#RC-XXXXXX

Include:

- order number
- amount
- delivery address
- items
- payment status
- expected delivery information if available

Actions:

[ CONTINUE SHOPPING ]

[ VIEW ORDER ]

Keep this screen minimal.

No confetti.

No excessive animations.

---

# 32 — SUCCESS ANIMATION

Use a restrained editorial animation.

Example:

thin line
↓
circle/mark
↓
ORDER CONFIRMED

Animation duration:

500–900ms

No:

confetti
fireworks
emoji
giant checkmark

---

# 33 — FORM VALIDATION

Validation must be clear but quiet.

Do not use browser-default ugly alerts.

Example:

Pincode

Please enter a valid 6-digit pincode.

Email

Please enter a valid email address.

Errors should appear near the relevant field.

Do not move the entire page unexpectedly when errors appear.

---

# 34 — FORM UX

Use:

- labels
- clear focus state
- error state
- disabled state
- loading state
- success state

Submit button states:

READY
→
PROCESSING
→
SUCCESS / ERROR

While submitting:

disable duplicate submission.

---

# 35 — CHECKOUT LOADING

When checkout is processing:

Do not show a full-page spinner unless absolutely necessary.

Use a subtle button state:

PROCESSING...

or an equivalent minimal loading treatment.

Prevent:

double clicks
duplicate orders
duplicate payment attempts

---

# 36 — MOBILE CHECKOUT

This is a PRIMARY requirement.

Most users are mobile.

Test at:

375px
390px
430px

Layout:

CHECKOUT
↓
CONTACT
↓
DELIVERY
↓
SHIPPING
↓
ORDER SUMMARY
↓
PAYMENT
↓
PLACE ORDER

Order summary may become collapsible.

CTA should remain easy to reach.

Do NOT create an enormous sticky checkout bar that covers content.

---

# 37 — DESKTOP CHECKOUT

At desktop widths:

Use a balanced two-column layout.

Example:

──────────────────────────────────────

CUSTOMER / DELIVERY     ORDER

CONTACT                 PRODUCTS

ADDRESS                 SUBTOTAL

SHIPPING                SHIPPING

PAYMENT                 TOTAL

          [ PLACE ORDER ]

──────────────────────────────────────

Do not make the right column excessively large.

Maintain editorial whitespace.

---

# 38 — RESPONSIVE BREAKPOINTS

Test:

375px
390px
430px
768px
1024px
1280px
1440px
1920px

No:

horizontal scrolling
cut-off labels
overflowing prices
buttons outside viewport
broken product images
collapsed form fields

---

# 39 — CART / WISHLIST CONSISTENCY

Wishlist and Bag must share:

- product identity
- product image
- price source
- variant logic
- availability logic

Do not maintain separate product definitions for wishlist and bag.

There must be one canonical catalog.

---

# 40 — INVENTORY HANDLING

Before adding to bag:

validate availability.

Before checkout:

validate again.

Before finalizing payment/order:

validate again where appropriate.

This protects against:

User A buys last item
↓
User B checkout still shows item available

Never assume the client knows current inventory.

---

# 41 — DATABASE SECURITY

If using Supabase:

Implement RLS appropriately.

Users must only be able to access:

- their wishlist
- their orders
- their own saved addresses where applicable

Sensitive order/payment operations must happen server-side.

Never expose:

payment secrets
service-role keys
private API credentials

to the browser.

---

# 42 — IDEMPOTENCY

Checkout and payment requests must be protected against duplicates.

Example:

User double-clicks:

PLACE ORDER

The system must NOT create:

Order A
Order B
Order C

from one intended purchase.

Use an idempotency strategy appropriate to the existing payment provider
and backend architecture.

---

# 43 — ERROR HANDLING

Every network operation must have:

loading
success
failure

states.

Handle:

- product unavailable
- variant unavailable
- wishlist failure
- cart failure
- address failure
- shipping failure
- payment failure
- payment pending
- server error
- authentication expiry
- network disconnect

Errors should be human-readable.

Avoid raw:

500 Internal Server Error

as the user-facing message.

---

# 44 — SECURITY

Never trust client-side:

price
discount
inventory
shipping
payment status
order total

Never expose server secrets.

Never allow a client to modify another user's order.

Never allow the client to mark an order as paid.

Never assume a successful redirect means payment succeeded.

---

# 45 — PERFORMANCE

The wishlist and checkout must feel immediate.

Use optimistic UI where safe.

Do NOT block the entire page for:

- wishlist toggle
- removing wishlist item
- quantity updates

Use skeleton/loading states only where necessary.

Avoid unnecessary global React renders.

Avoid refetching the entire product catalog after:

wishlist toggle
cart update
quantity change

Update only the required state.

---

# 46 — ANIMATION

Use the existing animation stack.

Possible existing tools:

- GSAP
- Motion / Framer Motion
- Lenis

Do NOT add another animation library.

Animations should be:

150–400ms for micro interactions

500–900ms for larger transitions

Keep them subtle.

Respect:

prefers-reduced-motion

---

# 47 — WISHLIST ANIMATION

Heart/icon:

idle
↓
tap
↓
small scale
↓
filled/active
↓
return to normal

No huge bounce.

No emoji.

No confetti.

---

# 48 — CHECKOUT TRANSITIONS

Sections can appear progressively as the user moves through checkout.

Use subtle opacity/translate transitions.

Do NOT animate every input field individually.

The checkout should remain fast.

---

# 49 — DESIGN SYSTEM

Use existing Resham Chikankari tokens.

Primary green:

#3F5031

Ivory / background:

#FFF9F4

Ink:

#161616

Use existing project tokens if they have already been normalized.

Do not create another competing palette.

---

# 50 — TYPOGRAPHY

Use the existing typography system.

Hierarchy:

Editorial serif
↓
section heading

Sans / grotesk
↓
UI
labels
inputs
prices
buttons

Do not introduce random fonts.

---

# 51 — ICONOGRAPHY

Replace all generic emojis.

Use the project's existing icon library.

Icons should be:

- thin
- geometric
- restrained
- consistent

Relevant icons:

Heart
Bag
Trash
Arrow
Chevron
Lock
Check
Alert
Credit card/payment icon if needed

No emoji symbols.

---

# 52 — ACCESSIBILITY

Ensure:

- keyboard navigation
- visible focus states
- semantic labels
- accessible buttons
- accessible form inputs
- proper error association
- sufficient contrast
- screen-reader-friendly status messages

Touch targets should be comfortably tappable on mobile.

---

# 53 — ROUTING

Required routes should follow the existing application routing structure.

Conceptually:

/wishlist

/cart

/checkout

/order/[id]

Do not create routes if equivalent existing routes already exist.

Use Next.js navigation.

Do not perform full browser reloads for normal navigation.

---

# 54 — AUTH REDIRECTS

If checkout requires authentication:

User not authenticated
↓
login
↓
return to checkout

Do not dump the user onto the homepage.

Preserve their intended destination.

Likewise:

Wishlist
↓
login
↓
return to wishlist

---

# 55 — BROWSER BACK/FORWARD

Test:

Product
→ Wishlist
→ Bag
→ Checkout
→ Back

The user should not encounter broken state.

Test:

Checkout
→ Payment
→ Back

Handle payment/order state safely.

Never accidentally submit a second payment/order because of browser
navigation.

---

# 56 — REFRESH BEHAVIOR

Refresh:

Wishlist

must preserve persisted wishlist.

Refresh:

Checkout

must not lose critical checkout information unnecessarily.

Refresh:

Order confirmation

must not recreate the order.

Never create orders simply because an order confirmation route loaded.

---

# 57 — EMPTY STATES

Wishlist empty:

minimal editorial composition.

Bag empty:

reuse existing bag empty state.

Checkout empty:

If cart becomes empty before checkout:

redirect gracefully to Bag or Shop.

Do not show a broken checkout page.

---

# 58 — FINAL USER FLOW

The complete expected flow:

USER
 ↓
PRODUCT
 ↓
♡ SAVE
 ↓
WISHLIST
 ↓
MOVE TO BAG
 ↓
BAG
 ↓
CHECKOUT
 ↓
CONTACT
 ↓
ADDRESS
 ↓
PINCODE VALIDATION
 ↓
SHIPPING
 ↓
ORDER SUMMARY
 ↓
PAYMENT
 ↓
SERVER VERIFICATION
 ↓
ORDER CONFIRMED
 ↓
ORDER CONFIRMATION
 ↓
CONTINUE SHOPPING

Every step must preserve state correctly.

---

# 59 — TEST MATRIX

## Wishlist

[ ] Add product
[ ] Remove product
[ ] Refresh
[ ] Logout
[ ] Login
[ ] Duplicate add
[ ] Move to bag
[ ] Sold-out product
[ ] Missing variant
[ ] Mobile
[ ] Desktop
[ ] Network failure

## Checkout

[ ] Empty bag
[ ] Valid address
[ ] Invalid address
[ ] Invalid pincode
[ ] Invalid phone
[ ] Invalid email
[ ] Product becomes unavailable
[ ] Quantity changes
[ ] Shipping calculation
[ ] Payment success
[ ] Payment failure
[ ] Payment pending
[ ] Retry
[ ] Double click
[ ] Refresh
[ ] Browser back
[ ] Mobile
[ ] Desktop
[ ] Network failure

---

# 60 — PERFORMANCE ACCEPTANCE

Target experience:

Wishlist toggle:
near-instant UI response

Bag:
no visible full-page re-render

Checkout:
fast initial render

Navigation:
no unnecessary full reload

Payment:
clear processing state

Order confirmation:
immediate after verified payment

Do not optimize by sacrificing correctness.

---

# 61 — DO NOT BREAK EXISTING SYSTEMS

Before modifying anything inspect:

- auth
- Supabase client
- catalog
- product model
- cart store
- bag logic
- payment logic
- routing
- existing API routes
- existing design tokens
- existing loading states

Do not overwrite working systems.

Do not duplicate functionality.

If an existing implementation already handles a requirement,
extend it instead of replacing it.

---

# 62 — IMPLEMENTATION ORDER

Execute in this exact order.

STEP 1
Audit existing ecommerce architecture.

STEP 2
Document current:

auth
catalog
cart
database
payment
routing

STEP 3
Implement/finish Wishlist persistence.

STEP 4
Connect Wishlist to Auth.

STEP 5
Implement Move to Bag.

STEP 6
Implement availability/variant validation.

STEP 7
Build Wishlist responsive UI.

STEP 8
Build checkout data model.

STEP 9
Build checkout validation.

STEP 10
Build address/contact form.

STEP 11
Implement server-side totals.

STEP 12
Implement shipping abstraction.

STEP 13
Implement payment creation.

STEP 14
Implement server-side payment verification.

STEP 15
Implement order lifecycle.

STEP 16
Implement success state.

STEP 17
Implement payment failure/retry.

STEP 18
Implement mobile checkout.

STEP 19
Test complete purchase flow.

STEP 20
Performance pass.

STEP 21
Accessibility pass.

STEP 22
Responsive pass.

STEP 23
Final visual polish.

---

# 63 — DEFINITION OF DONE

PHASE 14 is complete only when:

[ ] Wishlist works without page reload
[ ] Wishlist persists
[ ] Wishlist integrates with authentication
[ ] Duplicate wishlist entries impossible
[ ] Move to Bag works
[ ] Variant selection works
[ ] Availability is respected
[ ] Empty state is complete
[ ] Mobile UI is polished
[ ] Desktop UI is polished
[ ] No emoji UI
[ ] No WooCommerce-looking components

PHASE 15 is complete only when:

[ ] Checkout validates cart
[ ] Contact information works
[ ] Address works
[ ] Pincode validation works
[ ] Shipping works
[ ] Order summary is accurate
[ ] Server calculates final amount
[ ] Payment integration works
[ ] Payment is verified server-side
[ ] Order lifecycle works
[ ] Duplicate orders are prevented
[ ] Failure state works
[ ] Retry works
[ ] Confirmation works
[ ] Mobile checkout works
[ ] Desktop checkout works
[ ] Refresh/back behavior is safe
[ ] Authentication state is safe
[ ] RLS/security is correct
[ ] No secrets reach client
[ ] Performance is acceptable

---

# FINAL DESIGN PRINCIPLE

This is still Resham Chikankari.

The user should feel that:

PRODUCT
→ WISHLIST
→ BAG
→ CHECKOUT
→ PAYMENT
→ ORDER

is one continuous experience.

Do not make Checkout look like a separate application.

Do not make Wishlist look like a generic ecommerce dashboard.

Keep the existing editorial identity:

quiet
minimal
craft-focused
spacious
premium
responsive
fast

FUNCTIONALITY FIRST.
THEN MOTION.
THEN MICRO-POLISH.

Never sacrifice payment correctness, inventory correctness,
security or accessibility for visual effects.