# Resham Chikankari — Editorial Homepage Redesign Implementation

## 0. Purpose

Implement the new **Resham Chikankari homepage composition** from the supplied hand-drawn wireframes while preserving the existing website's visual identity, hero imagery, product-card design, navigation, cart/wishlist behavior, authentication, and current functionality.

This is **not a redesign of the entire website**.

The existing hero is already approved and must remain visually intact. The goal is to add a stronger editorial narrative **around the existing hero and product experience**.

The supplied wireframes define the intended composition:

- Hero at the top
- Lotus decorative motif begins in the hero
- Product/new-arrival section follows
- Lotus becomes a visual storytelling element for the craftsmanship/work section
- Reviews appear in an arc/radial composition
- Contact CTA becomes a quiet editorial section
- Footer ends with oversized `Resham` + `Chikankari` typography and the existing footer functionality

The final result should feel like a **premium Indian fashion/editorial website**, not a conventional WooCommerce storefront.

---

# 1. NON-NEGOTIABLE DESIGN RULES

## Preserve what already works

DO NOT unnecessarily change:

- Existing hero image
- Existing hero typography
- Existing hero copy
- Existing hero CTA behavior
- Existing product-card design
- Existing product image proportions
- Existing product data
- Existing cart functionality
- Existing wishlist functionality
- Existing authentication
- Existing account dropdown
- Existing navigation structure unless a small responsive adjustment is required
- Existing footer functionality

The new work is primarily about:

1. page composition
2. editorial storytelling
3. lotus motion
4. section transitions
5. review presentation
6. contact section
7. footer typography
8. responsive behavior
9. performance

Do not replace a good existing component merely because a new implementation is possible.

---

# 2. VISUAL DIRECTION

## Brand

Resham Chikankari should feel:

- handcrafted
- quiet luxury
- Indian
- editorial
- feminine without becoming overly decorative
- premium
- tactile
- spacious
- contemporary
- culturally rooted

Avoid:

- generic ecommerce layouts
- excessive cards
- excessive rounded rectangles
- gradients everywhere
- neon colors
- excessive shadows
- unnecessary glassmorphism
- oversized UI controls
- generic stock illustrations
- excessive animation
- "template" aesthetics

The site should feel closer to a fashion editorial / luxury craft publication than a standard online store.

---

# 3. COLOR SYSTEM

Primary brand green:

```text
#3F5031
```

Use the existing warm background / damask background system already implemented in the website.

Suggested semantic tokens:

```css
--rc-green: #3F5031;
--rc-cream: #FFF9F4;
--rc-paper: #F7F1EA;
--rc-ink: #171513;
--rc-muted: #756F68;
--rc-line: rgba(23, 21, 19, 0.16);
--rc-pink: #E99BAF;
```

Do not introduce a large new palette.

The lotus should use a subtle low-contrast treatment derived from the existing cream/green palette.

---

# 4. PAGE STRUCTURE

The homepage should conceptually become:

```text
NAVIGATION
│
├── EXISTING HERO
│
├── NEW ARRIVALS / PRODUCTS
│
├── CRAFT / OUR WORK STORY
│
├── REVIEWS
│
├── CONTACT CTA
│
└── EDITORIAL FOOTER
```

The lotus is the visual thread connecting these sections.

---

# 5. HERO — KEEP THE EXISTING HERO

## Important

Do not redesign the hero.

The current hero already contains:

- the large Chikankari visual
- model imagery
- editorial headline
- CTA buttons
- brand navigation

Keep those elements.

Only introduce the lotus as an additional decorative storytelling layer.

---

# 6. LOTUS STORYTELLING SYSTEM

The lotus is the main visual interaction requested by the client.

Create one reusable lotus SVG component:

```text
components/
  decorative/
    LotusJourney.tsx
```

The lotus should preferably be:

- SVG
- outline only
- transparent background
- no filled rectangular background
- subtle
- scalable
- lightweight

Do not rasterize it.

## SVG requirements

The SVG must:

- scale cleanly
- preserve aspect ratio
- work on mobile
- use `currentColor` where practical
- allow opacity to be controlled through CSS/GSAP
- not interfere with pointer events

Example conceptual structure:

```tsx
<svg
  viewBox="0 0 500 500"
  aria-hidden="true"
  className="lotus-svg"
>
  ...
</svg>
```

---

# 7. LOTUS STATE MACHINE

The lotus should feel like one continuous visual object travelling through the homepage.

Do NOT create disconnected lotus illustrations for every section.

Use a single controlled visual journey.

Conceptual states:

```text
STATE 01 — HERO
       ↑
      lotus
       │
       │ scroll
       ↓
STATE 02 — PRODUCTS
       ↓
STATE 03 — CRAFT / WORK
       ↘
       enlarged + bottom/right
       ↓
STATE 04 — REVIEWS
       ↓
       bottom centre
       ↓
STATE 05 — CONTACT
       ↓
STATE 06 — FOOTER
```

---

# 8. LOTUS — HERO STATE

At the beginning of the page:

- Lotus faces upward.
- Position it around the lower/transition area of the hero.
- It must not obstruct the hero headline or model.
- Keep it subtle.
- It should feel like an ornamental motif rather than a UI element.

Initial values should be approximately:

```text
rotation: 0deg
scale: 0.75–0.9
opacity: 0.18–0.30
position: center/lower hero
```

These are starting values only. Tune visually.

---

# 9. LOTUS — HERO → PRODUCTS

As the user scrolls from the hero toward the product section:

The lotus gradually rotates.

Desired visual idea:

```text
Hero:

       🌸
      /│\
     / │ \
       │


Scrolling:


      \ │ /
       \│/
       / \
      /   \


Products:

       \ | /
        \|/
        /\
       /  \
```

The lotus should eventually face downward.

Do NOT make the rotation feel like a spinning loading icon.

Use a slow, elegant rotation.

Example GSAP concept:

```js
gsap.to(lotus, {
  rotation: 180,
  ease: "none",
  scrollTrigger: {
    trigger: heroToProducts,
    start: "top top",
    end: "bottom top",
    scrub: 1.2,
  }
});
```

Tune the actual degree value based on the SVG's natural orientation.

---

# 10. LOTUS — PRODUCTS → CRAFT / OUR WORK

The second wireframe introduces the lotus as part of the craftsmanship story.

When the user reaches the craft/work section:

- lotus becomes larger
- lotus moves toward the bottom-right
- lotus sits partially behind/around the content
- it should feel like a decorative embroidery motif
- it must never cover important text

Suggested starting state:

```text
scale: 1.25–1.7
x: +20% to +35%
y: +15% to +25%
rotation: approximately 180deg
opacity: 0.14–0.25
```

The exact values must be tuned responsively.

---

# 11. CRAFT / OUR WORK SECTION

Create a premium editorial section based on the second supplied wireframe.

Concept:

```text
┌───────────────────────────────────────────┐
│                                           │
│  [ LARGE PRODUCT / CRAFT IMAGE ]          │
│                                           │
│                     OUR CRAFT              │
│                     ─────────              │
│                     Handcrafted...         │
│                                           │
│                     Details on             │
│                     workmanship            │
│                     fabric                 │
│                     quality                │
│                                           │
│                                  LOTUS     │
│                               ╲           │
└───────────────────────────────────────────┘
```

The section should explain:

- what Chikankari means to the brand
- craftsmanship
- fabric
- handwork
- attention to detail
- quality
- modern interpretation of traditional work

Do not turn this into a large paragraph.

Use:

- short editorial heading
- short supporting copy
- subtle metadata / labels
- one strong image
- generous whitespace

---

# 12. CRAFT IMAGE BEHAVIOR

Product/craft imagery must never be cropped aggressively.

Prefer:

```css
object-fit: contain;
```

when the entire garment/product needs to remain visible.

Use:

```css
object-fit: cover;
```

only where the source image is intentionally photographic/editorial and cropping is visually acceptable.

Never force product imagery into generic ecommerce rectangles.

---

# 13. PRODUCTS SECTION

Keep the existing product cards.

Do not redesign them.

Only improve:

- section spacing
- alignment
- heading hierarchy
- responsive grid
- transition into the craft section
- relationship between the cards and lotus

The product section should feel like part of the editorial story instead of a separate ecommerce widget.

Suggested structure:

```text
NEW ARRIVALS

      ─────────

[ CARD ]   [ CARD ]   [ CARD ]
[ CARD ]   [ CARD ]   [ CARD ]
```

Maintain the current card visual language.

---

# 14. PRODUCTS → REVIEWS TRANSITION

The transition should be calm.

Avoid:

- hard section borders
- abrupt color changes
- large animated text
- excessive parallax

Allow the lotus to guide the viewer.

The lotus should move from the craft area toward the lower centre as reviews approach.

---

# 15. REVIEWS SECTION

Use the third major wireframe concept.

The review section should NOT look like a standard carousel.

Instead, create an editorial radial/arc arrangement.

Concept:

```text

             [ review ]
        [ review ]   [ review ]

     [ review ]       [ review ]

              REVIEWS

          [ SUBMIT REVIEW ]
```

The cards should form a smooth arc around the central content.

---

# 16. REVIEW CARD DESIGN

Review cards should be:

- compact
- premium
- slightly rounded
- cream/paper colored
- subtle border
- minimal shadow
- editorial typography

Each card can contain:

```text
★★★★★

"Beautiful work and
extremely comfortable."

— Customer Name
```

If an image exists:

```text
[customer image]

★★★★★
"Review text..."
```

Do not make the cards huge.

The central heading remains the visual anchor.

---

# 17. REVIEW ARC IMPLEMENTATION

Use CSS transforms or GSAP.

Prefer CSS for the basic geometry.

Example conceptual positions:

```text
card 1:
transform: translateY(40px) rotate(-18deg)

card 2:
transform: translateY(10px) rotate(-10deg)

card 3:
transform: translateY(-5px) rotate(-4deg)

card 4:
transform: translateY(-5px) rotate(4deg)

card 5:
transform: translateY(10px) rotate(10deg)

card 6:
transform: translateY(40px) rotate(18deg)
```

Then use GSAP only for entrance/micro-motion.

Do not animate every card continuously.

---

# 18. REVIEW SECTION LOTUS

At the reviews section:

The lotus should:

- move toward the bottom centre
- become a subtle decorative anchor
- sit behind the review composition
- remain low contrast
- never interfere with text

Suggested:

```text
position: bottom center
scale: 1.1–1.5
opacity: 0.10–0.18
```

The review cards remain in front.

Use z-index deliberately:

```text
background
lotus
review cards
text
interactive buttons
```

---

# 19. SUBMIT REVIEW

The central review CTA should allow customers to submit a review.

Button:

```text
SHARE YOUR EXPERIENCE →
```

or:

```text
WRITE A REVIEW →
```

On click, open a lightweight modal/drawer.

Fields:

```text
Name
Rating
Review
Image (optional)
Submit
```

The image upload should be optional.

The form should:

- validate input
- show loading state
- prevent duplicate submissions
- show success state
- handle errors gracefully

Do not force users to navigate away from the page just to submit a review.

---

# 20. REVIEW IMAGE UPLOAD

If the current backend already supports Supabase Storage, use the existing storage architecture.

Do not introduce another image service only for reviews.

Flow:

```text
User selects image
        ↓
Validate type/size
        ↓
Upload to storage
        ↓
Create review record
        ↓
Review enters pending/approved state
        ↓
Approved review appears publicly
```

Recommended accepted types:

```text
image/jpeg
image/png
image/webp
```

Do not trust client-side validation alone.

Server-side validation is required.

---

# 21. REVIEW MODERATION

If the existing admin panel supports reviews, connect the review submission system to it.

New review:

```text
pending
```

Admin can:

```text
approve
reject
delete
```

Only approved reviews appear on the public homepage.

Do not automatically expose unmoderated user-generated content.

---

# 22. CONTACT SECTION

The contact section should be extremely minimal.

The third wireframe suggests a large quiet editorial block.

Concept:

```text
──────────────────────────────────────────

              CONTACT US

        Have something in mind?

             [ GET IN TOUCH ]

──────────────────────────────────────────
```

The section should NOT contain a giant form.

The button should navigate to the existing Contact Us page.

Use the site's existing route.

Example:

```text
/contact
```

Do not duplicate the contact page inside the homepage.

---

# 23. CONTACT TYPOGRAPHY

Make `CONTACT US` visually important.

Use:

- large serif display typography
- generous tracking
- centered layout
- subtle supporting line
- one premium CTA

Avoid:

- cards
- gradients
- icons everywhere
- large form blocks

---

# 24. FOOTER REDESIGN

Keep the current footer functionality.

Only change its visual hierarchy.

The final section should feature:

```text
RESHAM

CHIKANKARI
```

as oversized editorial typography.

IMPORTANT:

Do NOT cut either word.

Both words must remain fully visible.

Do not use:

```css
overflow: hidden;
```

in a way that clips the large typography.

---

# 25. FOOTER TYPOGRAPHY

The desired visual relationship is:

```text
RESHAM
       CHIKANKARI
```

or another carefully aligned stacked composition.

`Resham` and `Chikankari` should feel like separate typographic objects while remaining clearly part of the same brand.

Use responsive font sizing:

```css
font-size: clamp(4rem, 13vw, 15rem);
```

Tune based on the actual font.

Do not hardcode one enormous font size.

---

# 26. FOOTER CONTENT

Under the oversized brand typography, retain the useful footer content:

- Shop
- About
- Contact
- Policies
- Social links
- Copyright
- any currently existing legal links

Do not remove existing functionality.

The oversized typography is the editorial layer, not a replacement for navigation.

---

# 27. FOOTER FLOW

Desired hierarchy:

```text
CONTACT CTA
      ↓
large whitespace
      ↓
RESHAМ
CHIKANKARI
      ↓
footer navigation
      ↓
legal / copyright
```

The transition should feel like the website is slowly closing its story.

---

# 28. GSAP ARCHITECTURE

Use GSAP for meaningful scroll choreography.

Recommended:

```text
GSAP
 ├── ScrollTrigger
 ├── LotusJourney
 ├── Craft reveal
 ├── Review arc reveal
 └── Footer typography reveal
```

Do not animate everything.

The website should remain elegant when animations are disabled.

---

# 29. LOTUS GSAP IMPLEMENTATION

Create a dedicated hook:

```text
hooks/
  useLotusJourney.ts
```

Or a component-level GSAP controller:

```text
components/decorative/LotusJourney.tsx
```

The animation should be driven by scroll progress.

Conceptual timeline:

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: pageRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2,
  }
});

tl
  .to(lotus, {
    rotation: 180,
    ease: "none",
    duration: 1
  })
  .to(lotus, {
    xPercent: 28,
    yPercent: 20,
    scale: 1.45,
    duration: 1
  })
  .to(lotus, {
    xPercent: 0,
    yPercent: 45,
    scale: 1.25,
    duration: 1
  });
```

This is only a conceptual timeline.

Implement it according to the actual section geometry.

---

# 30. IMPORTANT — DO NOT USE ONE GIANT TIMELINE BLINDLY

Because the page can change height based on:

- product count
- image loading
- review count
- mobile layout
- font loading

prefer section-based ScrollTriggers where possible.

For example:

```text
Hero → Products
Products → Craft
Craft → Reviews
Reviews → Contact
```

This prevents the lotus from becoming misaligned when page content changes.

---

# 31. GSAP CLEANUP

Every GSAP animation must be cleaned up.

Use:

```js
gsap.context(...)
```

inside React effects where appropriate.

Kill/revert animations when components unmount.

Avoid:

```js
window.addEventListener(...)
```

without cleanup.

Avoid creating duplicate ScrollTriggers during Next.js route transitions.

---

# 32. NEXT.JS COMPATIBILITY

The project is Next.js.

Do not introduce an architecture that fights the existing Next.js routing system.

Be careful with Barba.js.

If using Barba:

- do not intercept navigation unnecessarily
- do not replace Next.js routing
- do not break App Router state
- do not cause duplicate React mounts
- do not destroy persistent cart/auth state
- do not create duplicate event listeners

If Barba introduces instability, prefer:

```text
Next.js navigation
+
GSAP transition components
```

over forcing Barba into the architecture.

---

# 33. FRAMER MOTION

Use Framer Motion only for local UI interactions where it provides value.

Good uses:

- modal
- review form
- mobile menu
- dropdown
- small hover/press states

GSAP is preferred for:

- scroll choreography
- lotus
- large editorial transitions

Do not animate the same element using GSAP and Framer Motion simultaneously.

---

# 34. ANIME.JS

Anime.js is optional.

Do not introduce Anime.js if GSAP already solves the animation.

Avoid having:

```text
GSAP
Framer Motion
Anime.js
Barba
```

all controlling the same element.

That creates unnecessary complexity.

---

# 35. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is enabled:

- disable lotus scroll animation
- disable large entrance animations
- remove continuous motion
- keep content visible
- preserve functionality

The lotus should simply appear in an appropriate static position.

---

# 36. MOBILE-FIRST REQUIREMENT

The majority of visitors are expected to use mobile.

Mobile is NOT a collapsed desktop version.

Design explicitly for:

```text
320px
360px
375px
390px
412px
430px
```

Then scale upward.

---

# 37. MOBILE LOTUS BEHAVIOR

Do not allow the lotus to:

- cover text
- cover product images
- create horizontal overflow
- push layout width
- become too large

On mobile the lotus can be smaller and more subtle.

The storytelling should remain:

```text
Hero → rotation
Products → downward
Craft → lower/right
Reviews → bottom centre
```

but with reduced scale.

---

# 38. REVIEW ARC ON MOBILE

Do NOT keep a wide desktop arc on a 360px screen.

Use a controlled mobile composition:

```text
       REVIEW

   [ card ]
[ card ][ card ]

       [ CTA ]
```

Or a horizontally scrollable review rail if the arc becomes too cramped.

Do not create horizontal page overflow just to preserve the desktop geometry.

---

# 39. RESPONSIVE FOOTER

The oversized footer text must always fit.

Use:

```css
font-size: clamp(...);
max-width: 100%;
overflow-wrap: anywhere;
```

Do not let:

```text
CHIKANKARI
```

create horizontal scrolling.

Test the footer at 320px.

---

# 40. RESPONSIVE IMAGE RULES

All images must use:

```css
max-width: 100%;
height: auto;
```

Avoid hardcoded dimensions that cause overflow.

Use responsive containers.

For important editorial images:

```css
width: 100%;
display: block;
```

and choose `object-fit` based on the actual image purpose.

---

# 41. HORIZONTAL OVERFLOW — ZERO TOLERANCE

The website must not horizontally scroll.

Test:

```js
document.documentElement.scrollWidth === window.innerWidth
```

or equivalent browser inspection.

The lotus must never cause:

```text
body width > viewport width
```

Use transforms rather than changing document layout dimensions.

Prefer:

```css
transform: translate3d(...)
```

instead of large `left/right` values that expand layout.

---

# 42. Z-INDEX SYSTEM

Create a deliberate z-index hierarchy.

Example:

```text
0     page background
5     decorative background
10    lotus
20    section content
30    navigation
40    dropdowns
50    modals
60    cart drawer
70    critical overlays
```

Do not randomly assign:

```text
z-index: 9999
z-index: 99999
```

everywhere.

This is especially important because the site previously had cart/shopping-bag layering problems.

---

# 43. CART / BAG SAFETY

The new homepage must not interfere with:

- cart drawer
- shopping bag
- checkout
- body scroll locking
- touchpad scrolling
- mobile swipe
- navigation

The decorative lotus must always have:

```css
pointer-events: none;
```

unless explicitly interactive.

Do not place it inside the cart drawer DOM tree.

---

# 44. PREVENT THE PREVIOUS HORIZONTAL-SWIPE BUG

The site previously showed a second page / horizontal content when swiping on a trackpad.

During this implementation verify:

```css
html,
body {
  max-width: 100%;
  overflow-x: clip;
}
```

If `overflow-x: clip` causes compatibility issues, use:

```css
overflow-x: hidden;
```

But do not use this to hide genuine layout bugs.

First identify which element is creating overflow.

Likely causes to inspect:

- transformed lotus
- oversized footer typography
- absolute decorative elements
- cart drawer
- hero image width
- negative margins
- GSAP xPercent
- fixed elements

---

# 45. PERFORMANCE REQUIREMENT

The homepage must remain fast.

Do not sacrifice performance for animation.

Use:

- transform
- opacity
- GPU-friendly animation
- lazy loading below-the-fold images
- responsive images
- Next/Image where appropriate
- preloading only critical hero assets
- minimal JavaScript
- no unnecessary rerenders

Avoid animating:

```text
width
height
top
left
margin
padding
```

during scroll.

Prefer:

```text
transform
opacity
```

---

# 46. IMAGE LOADING

Hero image:

```text
priority / preload
```

only if it is genuinely the LCP image.

Below-the-fold:

```text
lazy load
```

Use correct image dimensions to prevent layout shift.

Do not load every product image at initial page load.

---

# 47. CONTENT STABILITY

Prevent layout shift.

Sections should have predictable minimum dimensions.

Do not wait for the lotus/image to load and then suddenly change page height.

Use:

```css
aspect-ratio
```

or known dimensions where appropriate.

---

# 48. SECTION IDs

Create stable anchors:

```text
#home
#products
#craft
#reviews
#contact
#footer
```

These should not change between renders.

This helps:

- navigation
- accessibility
- analytics
- ScrollTrigger
- debugging

---

# 49. COMPONENT ARCHITECTURE

Suggested structure:

```text
app/
  page.tsx

components/
  home/
    Hero.tsx
    NewArrivals.tsx
    CraftStory.tsx
    ReviewsSection.tsx
    ContactCTA.tsx
    EditorialFooter.tsx

  decorative/
    LotusJourney.tsx

  reviews/
    ReviewCard.tsx
    ReviewArc.tsx
    ReviewForm.tsx

hooks/
  useLotusJourney.ts
  useReducedMotion.ts
```

Adapt this to the existing project architecture rather than blindly creating duplicate components.

---

# 50. DATA ARCHITECTURE

Do not hardcode product/review data into presentation components.

Products should continue coming from the existing catalog/data layer.

Reviews should come from the existing database.

The homepage should render:

```text
database/catalog
        ↓
server/data layer
        ↓
homepage
        ↓
presentation components
```

---

# 51. REVIEW EMPTY STATE

If there are no approved reviews, do NOT render an empty broken arc.

Show an elegant empty state:

```text
THE STORIES BEHIND THE STITCH

Be the first to share your experience.

[ WRITE A REVIEW → ]
```

Keep it minimal.

---

# 52. REVIEW LOADING STATE

Use lightweight skeletons.

Do not show large spinners.

The layout should remain stable while reviews load.

---

# 53. ACCESSIBILITY

The lotus is decorative:

```html
aria-hidden="true"
```

Buttons need accessible labels.

Review images need meaningful alt text.

Do not use text embedded inside images when real HTML text can be used.

Keyboard navigation must work.

Focus states must remain visible.

---

# 54. TYPOGRAPHY

Maintain the existing brand typography.

Use the existing serif/display font for:

- major editorial headings
- Resham Chikankari footer
- Contact heading

Use the existing clean sans-serif for:

- body
- navigation
- metadata
- buttons

Do not introduce multiple new font families.

---

# 55. SPACING SYSTEM

Use consistent spacing rather than arbitrary values.

Suggested scale:

```text
8
12
16
24
32
48
64
80
120
160
```

Large editorial sections can use:

```css
padding-block: clamp(5rem, 10vw, 10rem);
```

---

# 56. MICRO-INTERACTIONS

Use subtle interactions:

Product card:

```text
hover → image moves 2–4px
hover → wishlist icon subtly responds
```

Buttons:

```text
hover → slight background/text transition
```

Review cards:

```text
hover → tiny lift
```

Contact CTA:

```text
hover → arrow translates slightly
```

Avoid:

- bouncing
- spinning
- elastic UI everywhere
- excessive cursor effects

---

# 57. LOTUS MICRO-DETAIL

The lotus can have a very subtle opacity/parallax effect.

Example:

```text
scroll down:
opacity 0.18 → 0.24
```

Do not continuously rotate it beyond the intended scroll choreography.

The movement should communicate:

```text
craft → transformation → story
```

rather than "animation for animation's sake."

---

# 58. PAGE TRANSITION

If page transitions are already implemented:

Keep them.

If not, do not introduce a complicated transition framework just for this homepage.

A simple:

```text
opacity + translateY(8px)
```

transition is enough.

Do not delay navigation for decorative animation.

---

# 59. TESTING CHECKLIST

Before considering this complete, test:

### Desktop

- 1280px
- 1440px
- 1600px
- 1920px

### Tablet

- 768px
- 820px
- 1024px

### Mobile

- 320px
- 360px
- 375px
- 390px
- 412px
- 430px

---

# 60. FUNCTIONAL TESTING

Verify:

- navigation works
- Home always stays Home
- Shop navigation works
- product links work
- add to cart works
- delete from cart remains smooth
- wishlist works
- account dropdown works
- logout works
- authentication state remains correct
- cart drawer works
- checkout works
- review submission works
- review image upload works
- contact CTA works
- footer links work

---

# 61. SCROLL TESTING

Test:

```text
slow scroll
fast scroll
trackpad scroll
mouse wheel
touch scroll
mobile momentum scroll
```

The lotus must never:

- disappear permanently
- jump
- flash
- duplicate
- detach from the page
- cover important content
- cause horizontal scrolling

---

# 62. ROUTE TESTING

Navigate:

```text
Home
→ Shop
→ Product
→ Cart
→ Wishlist
→ Account
→ Home
```

Then return to Home.

Ensure:

- GSAP initializes once
- ScrollTriggers do not duplicate
- lotus does not appear twice
- page height remains correct
- cart state remains intact

---

# 63. GSAP DEBUGGING

During development, temporarily use:

```js
markers: true
```

for ScrollTrigger.

Verify trigger positions.

Remove markers before production.

Use:

```js
ScrollTrigger.refresh()
```

only where genuinely required.

Do not continuously call refresh on scroll.

---

# 64. FINAL VISUAL TARGET

The finished page should feel like:

```text
                 HERO
        existing hero — untouched

                    ↓

             NEW ARRIVALS
          existing cards — untouched

                    ↓

        ┌──────────────────────┐
        │                      │
        │   CRAFT / OUR WORK   │
        │                      │
        │  image + editorial   │
        │                 lotus│
        └──────────────────────┘

                    ↓

              REVIEWS

          ╭──────────────╮
       card              card
     card     REVIEWS      card
          card        card

             [ WRITE A REVIEW ]

                    ↓

              CONTACT US

           [ GET IN TOUCH ]

                    ↓

               RESHAM
             CHIKANKARI

             footer links
             legal/social
```

---

# 65. MOST IMPORTANT IMPLEMENTATION PRINCIPLE

Do not treat this as:

> "Add some animations to the homepage."

Treat it as:

> "Create one continuous editorial visual story using the existing Resham Chikankari website."

The lotus is the thread connecting the story.

The product cards represent the collection.

The craft section represents the making.

The reviews represent the people.

The contact section represents the relationship.

The oversized footer represents the brand.

Everything should feel like one composition.

---

# 66. IMPLEMENTATION PHASES

## PHASE 1 — Audit

Before changing anything:

- inspect existing homepage
- identify current Hero component
- identify product section
- identify existing footer
- identify review/database logic
- identify current GSAP setup
- identify current CSS/global styles
- identify image loading strategy
- identify existing cart/wishlist state
- identify existing responsive breakpoints

Do not duplicate existing functionality.

---

## PHASE 2 — Build Lotus

Create:

```text
LotusJourney
```

Test it independently.

Requirements:

- SVG
- pointer-events none
- responsive
- accessible as decorative content
- no layout width expansion

---

## PHASE 3 — Hero Integration

Add lotus without changing hero design.

Verify:

- no hero layout shift
- no image cropping changes
- no horizontal overflow
- no text obstruction

---

## PHASE 4 — Product Integration

Keep product cards unchanged.

Add the lotus transition.

Test on mobile.

---

## PHASE 5 — Craft Story

Build the editorial craft section.

Use existing product/craft assets.

Keep content concise.

---

## PHASE 6 — Reviews

Build:

```text
ReviewArc
ReviewCard
ReviewForm
```

Connect to the existing backend.

Add moderation compatibility with the admin panel.

---

## PHASE 7 — Contact

Build minimal CTA section.

Connect to existing contact route.

---

## PHASE 8 — Footer

Add oversized:

```text
RESHAM
CHIKANKARI
```

while preserving current footer links/functionality.

Test 320px width carefully.

---

## PHASE 9 — Animation Polish

Add:

- lotus choreography
- section reveal
- review arc entrance
- subtle CTA interactions
- footer typography reveal

Keep animation restrained.

---

## PHASE 10 — Performance

Run:

- production build
- Lighthouse
- mobile performance test
- network throttling
- image loading audit

Fix performance before adding additional effects.

---

## PHASE 11 — Responsive QA

Test all target widths.

Fix actual layout issues rather than hiding them with arbitrary overflow rules.

---

# 67. DEFINITION OF DONE

This implementation is complete only when:

- Existing hero remains visually correct
- Existing product cards remain visually correct
- Lotus journey works smoothly
- Lotus rotates between hero/products
- Lotus enlarges and moves to craft section
- Lotus moves to bottom-centre for reviews
- Reviews form works
- Review image upload works if storage is available
- Reviews are moderated before appearing
- Contact CTA works
- Footer contains oversized Resham + Chikankari
- Neither footer word is clipped
- No horizontal scrolling exists
- Cart drawer is unaffected
- Wishlist is unaffected
- Authentication is unaffected
- Navigation is unaffected
- Mobile layout is polished
- Reduced motion works
- No duplicate GSAP ScrollTriggers
- No obvious layout shift
- No unnecessary page-loading delay
- Production build passes
- TypeScript passes
- Existing functionality remains intact

---

# 68. FINAL INSTRUCTION TO THE AI IMPLEMENTER

Before writing code, inspect the current project and reuse existing components/data wherever possible.

Do not rewrite working systems.

Do not replace the existing hero.

Do not redesign the existing product cards.

Do not change the existing ecommerce data model unless required.

Do not introduce a new animation framework if GSAP already handles the requirement.

Do not add decorative elements that create horizontal overflow.

Implement the homepage in phases.

After every phase:

1. run the type checker
2. run the build
3. inspect the page
4. test mobile
5. fix regressions
6. only then continue

The final result should look deliberately art-directed rather than algorithmically decorated.

The website should feel like **Resham Chikankari telling one continuous story from craft → collection → people → connection → brand.**
