# RESHAM CHIKANKARI
# RESPONSIVE SYSTEM + DEVICE QA
# PHASED IMPLEMENTATION SPECIFICATION

Project:
Resham Chikankari — Premium Chikankari Ecommerce Platform

Primary objective:

MAKE THE ENTIRE WEBSITE RESPONSIVE, STABLE AND VISUALLY CONSISTENT ACROSS EVERY PRACTICAL SCREEN SIZE.

The majority of users are expected to be mobile users.

Therefore:

MOBILE-FIRST IS THE PRIMARY DESIGN/ENGINEERING REQUIREMENT.

However, the implementation must also work correctly on:

- small phones
- normal phones
- large phones
- mobile landscape
- small tablets
- large tablets
- laptops
- desktop monitors
- ultrawide monitors
- high-DPI displays
- browser zoom
- dynamic mobile browser toolbars
- unusual viewport widths

The website must NEVER look like a desktop website that was simply squeezed onto a phone.

It must be intentionally responsive.

IMPORTANT:

DO NOT redesign the existing visual identity.

DO NOT replace the current product cards.

DO NOT change the existing aesthetic.

DO NOT remove the editorial character.

DO NOT remove animations.

DO NOT introduce arbitrary UI changes.

The goal is:

EXISTING DESIGN
+
ROBUST RESPONSIVE ENGINEERING
+
MOBILE-FIRST UX
+
ZERO OVERFLOW
+
ZERO BROKEN LAYOUTS


==================================================
PHASE 0 — READ THE EXISTING PROJECT FIRST
==================================================

Before changing anything, inspect the entire application.

Understand:

- Next.js architecture
- App Router structure
- global CSS
- Tailwind configuration
- CSS modules
- design tokens
- typography
- navbar
- hero
- product cards
- product detail
- cart
- cart drawer
- wishlist
- account
- checkout
- search
- authentication
- wallet
- footer
- 404
- editorial sections
- background system
- decorative SVGs
- animations
- GSAP
- Framer Motion

Do not start by changing CSS globally.

First identify where responsive behavior is currently controlled.


==================================================
PHASE 1 — ESTABLISH RESPONSIVE DESIGN TOKENS
==================================================

Create a consistent responsive system.

Do NOT scatter random pixel values throughout components.

Use centralized spacing and sizing principles.

The site currently has a premium editorial aesthetic.

Responsive behavior should preserve that aesthetic.

Use fluid values where appropriate.

Prefer:

clamp()

min()

max()

CSS Grid

Flexbox

responsive containers

over hundreds of hardcoded breakpoint-specific values.


==================================================
PHASE 2 — MOBILE-FIRST RULE
==================================================

All components should be designed from the smallest practical viewport upward.

Base styles:

MOBILE

Then progressively enhance:

TABLET

DESKTOP

LARGE DESKTOP

Do NOT design desktop first and then attempt to shrink it.

The mobile layout must be a deliberate composition.

Do not simply:

desktop grid
→ fewer columns

Instead determine:

- what content is essential
- what becomes stacked
- what becomes horizontally scrollable
- what disappears
- what becomes a drawer
- what becomes a compact control
- what changes interaction model


==================================================
PHASE 3 — BREAKPOINT STRATEGY
==================================================

Do NOT rely on only:

768px
1024px

Use responsive behavior based on actual layout requirements.

Suggested baseline:

< 360px
360–479px
480–767px
768–1023px
1024–1279px
1280–1535px
1536px+

These are NOT rigid design requirements.

Components should remain fluid between breakpoints.

Do not create unnecessary breakpoint-specific hacks.

The layout should work at:

320px

375px

390px

412px

430px

480px

768px

820px

1024px

1280px

1440px

1920px

2560px

and unusual intermediate widths.


==================================================
PHASE 4 — SMALL PHONE SUPPORT
==================================================

Explicitly test:

320px wide

360px wide

375px wide

Do not assume modern phones are always 390–430px.

At 320px:

- no horizontal scrolling
- navbar remains usable
- logo does not overlap
- cart icon remains accessible
- account control remains accessible
- product cards remain readable
- buttons remain usable
- text does not overflow
- product names do not collide
- prices do not collide
- images remain correctly proportioned
- checkout fields remain usable

Do not solve small-screen issues by simply reducing everything to tiny text.

Prioritize hierarchy.


==================================================
PHASE 5 — GLOBAL CONTAINER SYSTEM
==================================================

Create a consistent responsive content container.

Avoid:

width: 100vw

when it causes scrollbar-width issues.

Prefer:

width: 100%;
max-width: ...;
margin-inline: auto;
padding-inline: responsive value;

Be careful with:

100vw

because it can include the scrollbar width and create horizontal overflow.

Use:

100%

where appropriate.

Content must have safe horizontal padding on mobile.

Do not allow text or UI to touch the viewport edge unless intentionally designed.


==================================================
PHASE 6 — HORIZONTAL OVERFLOW AUDIT
==================================================

THIS IS A CRITICAL PHASE.

The entire application must be tested for horizontal overflow.

Check:

html
body
main
header
footer
sections
product grids
product cards
cart drawer
wishlist
modals
dialogs
dropdowns
images
SVGs
tables
forms
buttons
navigation
decorative elements

Find the ACTUAL element causing overflow.

Do not hide problems with:

overflow-x: hidden;

everywhere.

Only use overflow clipping when the overflowing element is intentionally decorative.

The goal is to FIX the source of overflow.

Test:

320px
375px
390px
430px
768px
1024px
1440px
1920px


==================================================
PHASE 7 — TRACKPAD / HORIZONTAL GESTURE TEST
==================================================

The site previously experienced a problem where horizontal trackpad gestures could reveal another page or expose content behind the cart.

This MUST NOT happen.

Test two-finger horizontal gestures.

Expected:

NO HORIZONTAL PAGE NAVIGATION.

NO SECOND PAGE SLIDING INTO VIEW.

NO HERO MOVING SIDEWAYS.

NO CART HIDING BEHIND CONTENT.

NO BODY WIDTH EXPANSION.

NO HORIZONTAL SCROLLBAR.

Pay special attention to:

- cart drawer
- mobile navigation
- image galleries
- carousels
- decorative SVGs
- large background elements


==================================================
PHASE 8 — NAVBAR
==================================================

The navbar is one of the highest priority responsive components.

Desktop:

existing editorial navigation.

Tablet:

reduce spacing intelligently.

Mobile:

use a deliberate mobile navigation architecture.

Do not squeeze all desktop navigation links into mobile.

Mobile should have:

- logo
- essential navigation trigger
- search if currently part of the design
- wishlist/cart access where appropriate

The existing user dropdown behavior must remain.

The user's name/account dropdown should remain minimal.

Do not allow:

logo overflow
navigation collision
icons touching each other
username wrapping awkwardly
cart count escaping the icon


==================================================
PHASE 9 — MOBILE NAVIGATION DRAWER
==================================================

If a mobile menu exists or is introduced:

It must be a true viewport-level overlay.

Use:

position: fixed

not an element that pushes the entire document sideways.

Opening the menu should:

- prevent background interaction
- preserve scroll state
- avoid horizontal overflow
- maintain correct z-index
- support Escape where appropriate
- support touch
- support keyboard navigation

Closing should restore the previous state.

Do not translate the entire website horizontally to reveal the menu.


==================================================
PHASE 10 — HERO
==================================================

The existing hero design must remain.

Responsive behavior should be intentional.

Desktop:

preserve editorial composition.

Tablet:

rebalance typography/image relationship.

Mobile:

recompose the hero rather than simply shrinking it.

Ensure:

- heading fits
- CTA remains accessible
- image remains visually strong
- decorative elements do not overflow
- text does not overlap image
- hero does not create excessive vertical whitespace

Use responsive typography.

Example concept:

font-size: clamp(...)

Do not create 10 separate font sizes for 10 screen widths.


==================================================
PHASE 11 — HERO HEIGHT
==================================================

Do NOT blindly use:

height: 100vh;

for every mobile hero.

Mobile browsers have dynamic address bars.

Use modern viewport units where appropriate:

svh
lvh
dvh

Example:

min-height: 100svh;

or an appropriate combination.

Do not create a situation where:

browser toolbar appears
→ hero jumps

browser toolbar disappears
→ hero jumps again.

Test mobile Safari/Chrome style dynamic viewport behavior.


==================================================
PHASE 12 — PRODUCT GRID
==================================================

Preserve the existing product card design.

Responsive grid should adapt naturally.

Example conceptual behavior:

mobile:
2 columns

tablet:
2–3 columns

desktop:
3–4 columns

large desktop:
4+ columns where visually appropriate

Do not force 4 desktop columns into a 320px phone.

Do not allow cards to become impossibly narrow.

Product card requirements:

- image maintains aspect ratio
- title remains readable
- price remains visible
- wishlist control remains accessible
- buttons remain touch-friendly
- no content collision


==================================================
PHASE 13 — PRODUCT CARD IMAGES
==================================================

IMPORTANT:

DO NOT CROP PRODUCT IMAGES.

The existing product imagery is part of the brand aesthetic.

Preserve the full composition.

Use appropriate:

object-fit

object-position

aspect-ratio

based on the actual image design.

Do not blindly use:

object-fit: cover;

if it cuts off the product.

Do not distort images.

Do not stretch images.

Do not create different image proportions randomly across breakpoints.


==================================================
PHASE 14 — PRODUCT DETAIL PAGE
==================================================

Desktop:

existing editorial two-column/split layout.

Mobile:

stack content intentionally.

Suggested hierarchy:

IMAGE
↓
PRODUCT NAME
↓
PRICE
↓
DESCRIPTION
↓
VARIANTS
↓
SIZE
↓
QUANTITY
↓
ADD TO BAG
↓
WISHLIST
↓
DETAILS

Do not force desktop columns onto mobile.

The Add to Bag CTA must remain immediately accessible.

Do not make users scroll through unnecessary decorative content before the primary purchase action.


==================================================
PHASE 15 — MOBILE PRODUCT GALLERY
==================================================

Product galleries must be touch-first.

Support:

swipe
tap
thumbnail selection where applicable

Avoid desktop hover assumptions.

Do not make image dragging interfere with page scrolling.

Prevent accidental horizontal page overflow.

Gallery width must remain within viewport bounds.

Do not load the entire gallery at maximum resolution simultaneously.


==================================================
PHASE 16 — CART
==================================================

THE CURRENT CART PERFORMANCE IS GOOD.

DO NOT REWRITE THE CART STATE ARCHITECTURE.

Preserve the existing optimistic delete/update behavior.

Responsive requirements:

mobile:
full-width or near-full-width cart experience

desktop:
existing drawer/page composition

The cart must never:

- overflow horizontally
- hide behind hero content
- expose another page
- create horizontal browser scrolling
- expand document width
- break on 320px screens

Touch targets must remain large enough for mobile interaction.


==================================================
PHASE 17 — CART DRAWER
==================================================

The cart drawer must be viewport-bound.

Use:

position: fixed

top: 0
right: 0
bottom: 0

On mobile:

width: min(100vw, appropriate max width)

On desktop:

existing preferred drawer width.

Do not use a fixed desktop width that causes mobile overflow.

Ensure:

max-width: 100vw;

box-sizing: border-box;


==================================================
PHASE 18 — WISHLIST
==================================================

Wishlist should adapt to mobile.

Maintain the existing aesthetic.

Cards must remain touch-friendly.

"Send All to Bag" must remain accessible.

Do not let long product names break the layout.

Buttons should wrap or stack gracefully.

No horizontal overflow.


==================================================
PHASE 19 — SEARCH
==================================================

Mobile search should be designed around touch.

Input:

- full usable width
- sufficient height
- clear focus state
- accessible close button

Search results:

- no tiny cards
- no overflow
- no accidental horizontal scrolling

Keyboard opening must not destroy layout.

Test viewport resizing when the mobile keyboard opens.


==================================================
PHASE 20 — ACCOUNT
==================================================

Account page must be mobile-first.

Forms:

- full width
- comfortable spacing
- large touch targets
- correct input types
- correct keyboard behavior

Phone input:

inputmode="tel"

Email:

inputmode="email"

Do not allow forms to zoom unexpectedly on mobile.

Ensure text input font sizes are appropriate for mobile browsers.


==================================================
PHASE 21 — CHECKOUT
==================================================

Checkout is one of the most important mobile flows.

Test:

PRODUCT
→ CART
→ CHECKOUT
→ ADDRESS
→ PAYMENT
→ SUCCESS

on small screens.

No:

- clipped inputs
- horizontal scroll
- buttons outside viewport
- payment UI overflow
- keyboard covering critical fields
- tiny touch targets

Primary CTA must remain obvious.

Do not sacrifice checkout speed for decorative animation.


==================================================
PHASE 22 — FORMS
==================================================

All forms must be responsive.

Inputs must use:

width: 100%;

with correct box-sizing.

Use:

box-sizing: border-box;

globally where appropriate.

Long:

email addresses
phone numbers
addresses
names

must not break layouts.

Error messages must wrap naturally.

Do not allow validation text to push unrelated elements off-screen.


==================================================
PHASE 23 — BUTTONS / TOUCH TARGETS
==================================================

Mobile controls must be touch-friendly.

Aim for approximately:

44px+

interactive target size

where practical.

Do not make buttons tiny simply to preserve desktop aesthetics.

Icon buttons need sufficient invisible hit area even if the visible icon remains minimal.

Avoid overlapping hitboxes.


==================================================
PHASE 24 — TYPOGRAPHY
==================================================

Typography must scale fluidly.

Use:

clamp()

where appropriate.

Do not allow:

headings to overflow
buttons to overflow
navigation text to collide
product names to break awkwardly

Long words should be handled intentionally.

Avoid:

overflow: hidden;

as a shortcut for text problems.

If text genuinely needs truncation, use an intentional design rule.


==================================================
PHASE 25 — BACKGROUND
==================================================

The existing:

bg.jpg

must work across all viewport sizes.

The image is 16:9.

Do not stretch it unnaturally.

Determine whether:

background-size: cover

or another strategy is appropriate for each section.

The background should remain aesthetically consistent.

Important:

The background must never create horizontal overflow.

Do not create an enormous element simply to display the background.

Decorative background elements should not determine document width.


==================================================
PHASE 26 — LOTUS / DECORATIVE SVG
==================================================

The lotus/floral SVG is decorative.

It must never affect layout width.

Use:

position: absolute/fixed

where appropriate.

Make sure its bounding box cannot create horizontal scrolling.

At mobile widths:

scale it appropriately.

Do not allow it to cover:

buttons
product information
navigation
checkout controls

Decorative assets must remain decorative.


==================================================
PHASE 27 — FOOTER
==================================================

Footer must be intentionally responsive.

Desktop:

existing multi-column layout.

Mobile:

stack sections.

Do not force tiny columns.

Links must remain touch-friendly.

Long legal/contact text must wrap naturally.

No horizontal overflow.


==================================================
PHASE 28 — 404 PAGE
==================================================

The existing minimal 404 page must work at:

320px
375px
430px
768px
1024px
1440px

404 typography must scale.

Buttons must remain accessible.

Decorative elements must not overflow.

Maintain the minimal editorial aesthetic.


==================================================
PHASE 29 — ANIMATION RESPONSIVENESS
==================================================

Existing GSAP / Framer Motion animations must be responsive.

Do not use identical animation distances across every viewport.

Example:

Desktop:

translateY(50px)

Mobile:

translateY(20px)

Keep motion subtle.

Reduce expensive animations on mobile.

Respect:

prefers-reduced-motion: reduce


==================================================
PHASE 30 — GSAP CLEANUP
==================================================

Audit every GSAP animation.

Ensure:

- ScrollTrigger instances are cleaned up
- no duplicate animations after route navigation
- no memory leaks
- no animation continuing after component unmount
- no event listeners accumulating

Next.js navigation must not create duplicate ScrollTriggers.

Test:

Home
→ Shop
→ Product
→ Home
→ Shop
→ Product

multiple times.

No duplicated animation behavior should appear.


==================================================
PHASE 31 — FRAMER MOTION
==================================================

Ensure AnimatePresence and layout animations do not create:

- width overflow
- temporary horizontal scroll
- elements outside viewport
- unexpected layout jumps

Be particularly careful with:

mobile menu
cart drawer
account dropdown
search overlay
wishlist transitions


==================================================
PHASE 32 — Z-INDEX SYSTEM
==================================================

Create a consistent stacking hierarchy.

Conceptually:

base content
↓
decorative layers
↓
sticky navbar
↓
dropdowns
↓
mobile menu
↓
modal
↓
cart drawer
↓
modal backdrop

Do not solve z-index issues by randomly using:

z-index: 999999999;

Create an intentional stacking system.


==================================================
PHASE 33 — SAFE AREA SUPPORT
==================================================

Support devices with display cutouts and home indicators.

Where appropriate use:

env(safe-area-inset-top)
env(safe-area-inset-bottom)
env(safe-area-inset-left)
env(safe-area-inset-right)

Especially for:

mobile navigation
cart drawer
bottom CTAs
checkout
fixed buttons

Do not allow content to be hidden behind the mobile home indicator.


==================================================
PHASE 34 — MOBILE LANDSCAPE
==================================================

Explicitly test phones in landscape.

Examples:

667 × 375

844 × 390

896 × 414

Ensure:

hero
navbar
cart
product gallery
checkout

do not become unusable.

Avoid assuming:

height = portrait height.


==================================================
PHASE 35 — TABLETS
==================================================

Test:

768px
820px
834px
1024px

Do not treat tablets as giant phones.

Do not treat tablets as small desktops.

Use the layout that best fits the available space.

Product grids should adapt naturally.


==================================================
PHASE 36 — LARGE DESKTOP
==================================================

Test:

1440px
1536px
1920px
2560px

Avoid excessive stretching.

The website should maintain editorial proportions.

Do not let content become absurdly wide.

Use:

max-width

for major content areas.

Large screens should feel intentional rather than empty.


==================================================
PHASE 37 — ULTRAWIDE
==================================================

Explicitly test:

2560 × 1080
3440 × 1440

No component should stretch indefinitely.

Hero:

maintain visual composition.

Product grid:

maintain reasonable card dimensions.

Text:

maintain readable line lengths.

Editorial sections:

maintain intended proportions.


==================================================
PHASE 38 — BROWSER ZOOM
==================================================

Test browser zoom:

80%
90%
100%
110%
125%
150%
200%

The website should remain functional.

At 200% zoom:

- no critical controls should disappear
- text should remain readable
- content should reflow
- horizontal scrolling should be minimized
- forms should remain usable

Do not use fixed pixel positioning for essential UI.


==================================================
PHASE 39 — ACCESSIBILITY
==================================================

Responsive design must remain accessible.

Check:

- keyboard navigation
- focus visibility
- touch targets
- semantic HTML
- aria labels
- screen reader behavior
- reduced motion

Do not remove focus indicators simply for aesthetics.

Do not use divs as buttons when a button is appropriate.


==================================================
PHASE 40 — PERFORMANCE
==================================================

Responsive improvements must not create performance regressions.

Do not ship separate huge desktop/mobile versions of the same asset unless necessary.

Use responsive images.

Use:

srcset

via next/image where appropriate.

Lazy-load below-the-fold images.

Do not preload mobile and desktop versions simultaneously.

Avoid expensive resize listeners.

Prefer CSS media queries.

If JavaScript must detect viewport size, use an efficient abstraction and avoid hydration mismatch.


==================================================
PHASE 41 — HYDRATION SAFETY
==================================================

Do not use:

window.innerWidth

during initial render

in a way that causes server/client mismatch.

Avoid:

if (window.innerWidth < 768)

directly inside render logic.

Prefer CSS responsive behavior.

If JavaScript viewport detection is genuinely required:

implement it safely after hydration.

Avoid rendering different DOM trees server-side and client-side based on unavailable viewport information.


==================================================
PHASE 42 — RESPONSIVE IMAGES
==================================================

Do not render:

desktop image size
on mobile

if unnecessary.

Use responsive image sizing.

However:

DO NOT create aggressive crops simply to optimize dimensions.

Product photography must preserve its intended composition.

Performance optimization must not damage product presentation.


==================================================
PHASE 43 — CSS AUDIT
==================================================

Search for dangerous patterns:

width: 100vw
position: fixed
position: absolute
white-space: nowrap
min-width
translateX
left: 50%
negative margins
large transforms
fixed widths
fixed heights
overflow
z-index
calc()
large decorative SVGs

Inspect each occurrence for responsive risks.

Do not remove these patterns blindly.

Fix only where they cause actual problems.


==================================================
PHASE 44 — RESPONSIVE QA MATRIX
==================================================

Every major page must be tested against:

DEVICE WIDTHS

320
360
375
390
412
430
480
768
820
834
1024
1280
1440
1536
1920
2560

PAGES

/
 /shop
 /product/[slug]
 /wishlist
 /cart
 /checkout
 /account
 /login
 /signup
 /404

Also test:

landscape
portrait
zoom
slow network
fast network
touch
mouse
trackpad
keyboard navigation


==================================================
PHASE 45 — INTERACTION QA
==================================================

Test:

NAVBAR
- open
- close
- scroll
- account dropdown

SEARCH
- open
- type
- results
- close

PRODUCT
- gallery
- variants
- size
- quantity
- add to bag
- wishlist

CART
- open
- close
- delete
- quantity
- coupon
- checkout

WISHLIST
- add
- remove
- add all to bag

ACCOUNT
- login
- logout
- dropdown

CHECKOUT
- address
- payment
- errors
- success

Nothing should cause horizontal overflow.


==================================================
PHASE 46 — AUTOMATED RESPONSIVE TESTING
==================================================

If Playwright is available, create or use responsive tests.

At minimum test:

320x800
375x812
390x844
430x932
768x1024
1024x768
1440x900
1920x1080

For each viewport:

check:

document.documentElement.scrollWidth
<=
window.innerWidth

If:

scrollWidth > innerWidth

investigate the actual overflowing element.

Do not simply hide overflow.

Take screenshots for important routes.

Compare screenshots across widths.


==================================================
PHASE 47 — REAL MOBILE TESTING
==================================================

Do not rely only on browser resizing.

Test actual mobile behavior where possible.

Especially:

- iOS Safari
- Android Chrome

Pay attention to:

dynamic viewport
keyboard
touch scrolling
momentum scrolling
safe areas
fixed elements
sticky elements
overscroll
horizontal gestures


==================================================
PHASE 48 — NO DESKTOP-ONLY ASSUMPTIONS
==================================================

Never assume:

hover exists.

Never make a critical action hover-only.

Never rely on:

mouseover

for essential functionality.

Mobile users must be able to access:

- product details
- wishlist
- add to bag
- account
- search
- navigation
- checkout

without hover.


==================================================
PHASE 49 — MOBILE-FIRST PRIORITY
==================================================

When there is a conflict between:

desktop decoration

and

mobile usability

PRIORITIZE MOBILE USABILITY.

But do not unnecessarily remove desktop design.

Recompose it intelligently.


==================================================
PHASE 50 — IMPLEMENTATION ORDER
==================================================

Implement in phases.

DO NOT change the entire application in one pass.


PHASE A
GLOBAL RESPONSIVE FOUNDATION

Fix:

- containers
- box sizing
- overflow
- typography scaling
- spacing tokens
- viewport behavior


PHASE B
NAVIGATION

Fix:

- desktop navbar
- tablet navbar
- mobile navbar
- account dropdown
- mobile menu
- z-index
- fixed positioning


PHASE C
HOME

Fix:

- hero
- background
- decorative SVG
- editorial sections
- responsive spacing
- product sections


PHASE D
SHOP

Fix:

- product grid
- cards
- images
- filtering
- search
- pagination/load more if present


PHASE E
PRODUCT DETAILS

Fix:

- gallery
- product information
- variants
- size
- quantity
- add to bag
- wishlist


PHASE F
CART

DO NOT REWRITE EXISTING LOGIC.

Fix only:

- responsive layout
- drawer width
- overflow
- mobile spacing
- touch interactions
- visual responsiveness


PHASE G
WISHLIST

Fix:

- mobile grid
- actions
- add all to bag
- empty state


PHASE H
ACCOUNT + AUTH

Fix:

- login
- signup
- Google auth
- profile
- logout dropdown


PHASE I
CHECKOUT

Fix:

- forms
- address
- payment
- validation
- mobile keyboard
- fixed CTA behavior


PHASE J
GLOBAL DECORATION + ANIMATION

Fix:

- GSAP responsive behavior
- Framer Motion
- lotus SVG
- bg.jpg
- page transitions
- scroll effects


PHASE K
DEVICE QA

Test every route at every important viewport.

Fix actual failures.

Do not introduce hacks just to pass one viewport.


==================================================
PHASE 51 — BUILD VALIDATION
==================================================

After each major phase:

npm run typecheck

npm run lint

npm run build

Do not continue if the build is broken.

Do not silence errors using:

any
@ts-ignore
@ts-expect-error

unless absolutely unavoidable and documented.


==================================================
PHASE 52 — FINAL PERFORMANCE CHECK
==================================================

After responsive implementation:

Re-check:

LCP
INP
CLS
TTFB

Ensure responsive changes did not:

- increase JS unnecessarily
- duplicate images
- introduce hydration problems
- create expensive resize listeners
- cause animation leaks
- create layout shifts


==================================================
PHASE 53 — FINAL ACCEPTANCE CRITERIA
==================================================

THE SITE IS NOT COMPLETE UNTIL:

[ ] 320px works
[ ] 360px works
[ ] 375px works
[ ] 390px works
[ ] 412px works
[ ] 430px works
[ ] 480px works
[ ] 768px works
[ ] 820px works
[ ] 834px works
[ ] 1024px works
[ ] 1280px works
[ ] 1440px works
[ ] 1536px works
[ ] 1920px works
[ ] 2560px works

AND:

[ ] no horizontal overflow
[ ] no broken navbar
[ ] no broken cart
[ ] no broken wishlist
[ ] no broken product gallery
[ ] no broken checkout
[ ] no broken authentication
[ ] no broken account dropdown
[ ] no broken mobile menu
[ ] no clipped buttons
[ ] no overflowing text
[ ] no distorted images
[ ] no product image cropping
[ ] no layout jumps
[ ] no duplicate GSAP animations
[ ] no horizontal trackpad navigation
[ ] no content hidden behind fixed elements
[ ] no unsafe viewport assumptions
[ ] no hydration mismatch
[ ] no TypeScript errors
[ ] production build succeeds


==================================================
FINAL PRINCIPLE
==================================================

The user should never think about the responsive implementation.

They should simply experience:

BEAUTIFUL
FAST
FLUID
RESPONSIVE
STABLE

The website should feel intentionally designed for their device.

Not:

"desktop website made responsive."

But:

"one premium ecommerce experience that naturally adapts to every screen."

MOBILE IS THE PRIMARY EXPERIENCE.

DESKTOP IS AN ENHANCEMENT.

PERFORMANCE IS NEVER SACRIFICED FOR DECORATION.

THE EXISTING CART OPTIMIZATION MUST NOT BE REGRESSED.