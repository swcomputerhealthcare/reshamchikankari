Act as a senior fashion ecommerce UI/UX designer + art director + frontend designer.

You are redesigning the existing Resham Chikankari website.

This is an Indian ethnic-fashion / Kurti brand. The website must feel like a premium contemporary Indian fashion catalogue, not a generic ecommerce store.

The existing implementation already has the basic structure and functionality. Do not rebuild the application architecture unnecessarily. Focus heavily on visual refinement, composition, typography, spacing, imagery, product cards, backgrounds, and overall brand atmosphere.

The supplied references are the visual direction.

1. CORE VISUAL DIRECTION

The website should communicate:

Modern Indian craftsmanship presented through an elegant editorial fashion experience.

Think:

premium Kurti catalogue
Indian handcrafted textile
soft editorial photography
botanical ornamentation
heritage-inspired patterns
contemporary fashion website
warm natural materials
sophisticated femininity
handcrafted imperfections
magazine-like composition

The website should NOT look like:

Shopify template
WooCommerce template
Amazon/Flipkart product grid
generic SaaS landing page
modern glassmorphism website
overly rounded UI
generic fashion marketplace

The goal is:

"A fashion editorial website that happens to have ecommerce functionality."

2. GLOBAL BACKGROUND

This is one of the most important changes.

Use the supplied damask pattern image as the primary visual background.

The background should be:

#FFF9F4

with the supplied subtle cream damask pattern.

The damask pattern must be:

extremely subtle
low contrast
elegant
seamless
non-distracting
fixed or subtly positioned
visible enough to establish texture
never strong enough to compete with product photography

The background should feel like:

luxury stationery / textile / handmade paper / heritage wallpaper

not a website texture.

3. BACKGROUND IMPLEMENTATION

Do NOT simply place the image as one giant <img> element.

Implement it as a global background layer.

Conceptually:

body {
  background-color: #FFF9F4;
  background-image: url(...);
  background-repeat: repeat;
  background-size: 520px auto;
}

Adjust the scale according to the actual asset.

The pattern should repeat naturally.

Add a very subtle opacity treatment if necessary.

Do not use an overly strong texture.

4. SAGE GREEN SECTION

The primary editorial green is:

#3F5031

This should become the major secondary environment of the website.

Important:

Do not use multiple unrelated greens.

Use:

#3F5031

as the main sage/forest green.

Possible derived shades may be generated from this color for borders and hover states, but the primary visual green should remain consistent.

5. SAGE + DAMASK RELATIONSHIP

The website should alternate naturally between:

Cream / Damask
#FFF9F4

and

Deep Sage
#3F5031

This creates the visual rhythm.

For example:

HEADER
↓
DAMASK / CREAM
↓
HERO IMAGE
↓
SAGE PRODUCT COLLECTION
↓
DAMASK EDITORIAL STORY
↓
SAGE COLLECTION
↓
DAMASK PRODUCT SECTION
↓
FOOTER

Do NOT put every section inside a white rectangle.

The entire viewport should feel like one connected art-directed composition.

6. REMOVE THE WHITE PRODUCT BLOCKS

This is mandatory.

The current product section has:

SAGE BACKGROUND
    ↓
WHITE ROUNDED CARD
    ↓
PRODUCT IMAGE

This looks like a standard ecommerce UI.

Remove the large white containers surrounding the product images.

Do NOT use:

background: white;
border-radius: 30px;
padding: 20px;

for the entire product card.

Instead:

SAGE BACKGROUND
       ↓
PRODUCT PHOTOGRAPHY
       ↓
PRODUCT NAME
       ↓
PRICE

The card should visually disappear into the environment.

7. PRODUCT CARD ART DIRECTION

The product cards are one of the most important parts of this redesign.

They should resemble the fashion catalogue/editorial reference, not ecommerce cards.

Think of each product as a fashion portrait placed into an editorial composition.

The image itself should be the hero.

8. PRODUCT IMAGE SHAPE

Use tall fashion-oriented image proportions.

Preferred:

4:5

or

3:4

Avoid square ecommerce cards wherever possible.

Example:

┌───────────────┐
│               │
│               │
│   MODEL /     │
│   KURTI       │
│               │
│               │
│               │
└───────────────┘
Product Name
₹1,899

But the image should NOT appear to be trapped inside a card.

9. NO HEAVY CARD BORDERS

Remove:

thick white border
heavy shadow
generic card elevation
large white container
excessive rounded corners

The product image should feel like part of the editorial page.

Use only a very subtle image treatment if necessary.

10. CARD COMPOSITION

Each product should have:

Image

Large portrait photography.

Small editorial metadata

For example:

NEW ARRIVAL

or

CHIKANKARI EDIT
Product name

Use Inter, clean and restrained.

Price

Use Inter.

Do not make price typography enormous.

11. GILDA DISPLAY USAGE

Use Gilda Display for:

section titles
collection titles
editorial product-category labels
campaign headlines

Do NOT use Gilda Display for every product name.

Example:

Gilda Display

New Arrivals

Inter

Gulabo Embroidered Cotton Kurti
₹1,899

This creates the contrast between:

fashion/editorial

and

commerce/functionality.

12. PRODUCT CARD HOVER

Desktop hover should feel editorial.

When hovering:

slightly enlarge image
subtly shift crop
reveal secondary product image if available
reveal wishlist icon
gently reveal "View Product"
do not create a large floating popup

Example:

Normal:

        IMAGE


Product Name
₹1,899


Hover:

        IMAGE
          +
   subtle secondary image
          +
       ♡
    View Product

Use approximately:

250–450ms

with a smooth easing curve.

No bounce animation.

13. PRODUCT CARD VARIATION

Do NOT make every card perfectly identical.

Use controlled editorial variation.

For example:

        LARGE
         IMAGE

       Product
       ₹Price


IMAGE        IMAGE
Product      Product
₹Price       ₹Price

Within a collection section, one featured product can be slightly larger.

This creates a fashion magazine rhythm.

Do this carefully.

Do not make the grid chaotic.

14. FEATURED PRODUCT

Introduce occasional featured products.

Example:

┌─────────────────────────────┐
│                             │
│                             │
│      LARGE PRODUCT IMAGE    │
│                             │
│                             │
└─────────────────────────────┘

THE SIGNATURE EDIT

Handcrafted chikankari,
reimagined for today.

EXPLORE

This should feel like an editorial campaign rather than another product card.

15. NEW ARRIVALS SECTION

The current:

New Arrivals

section is a good starting point but needs refinement.

Keep the sage environment:

#3F5031

but make the section feel more premium.

Use:

subtle damask texture
decorative botanical elements
Gilda Display heading
thin ornamental divider
large product photography
generous spacing
16. NEW ARRIVALS HEADING

Instead of simply:

New Arrivals
────────

create an editorial treatment:

        NEW ARRIVALS

          ✦

   The latest expressions
      of our craft.

The copy can be adapted.

The heading should be large and elegant.

17. DECORATIVE DIVIDERS

Use subtle ornamental dividers inspired by the supplied moodboard.

Examples:

──────── ✦ ────────

or botanical line art.

Do not overuse decorative symbols.

The decoration should appear intentionally placed.

18. BOTANICAL DECORATION

Introduce subtle botanical illustrations around sections.

Possible placement:

top-left of collection section
bottom-right
between editorial sections
around newsletter
footer corners

Use:

thin line art
muted cream
muted pink
slightly transparent sage
botanical floral forms

Do NOT cover product images.

Do NOT make the website look like a wedding invitation.

The decoration should be fashion editorial, not wedding stationery.

19. DAMASK + SAGE TEXTURE

The sage section can have the same damask pattern or a related textile texture.

However:

The pattern should be much darker/tonal on sage, not a white rectangle.

Example:

background: #3F5031
pattern: rgba(255,249,244,0.035)

The pattern should almost disappear when viewed from a distance.

When the user notices it, it should feel premium.

20. HERO REDESIGN

The current hero is structurally good.

Keep:

large fashion photography
model
strong typography
CTA
editorial composition

But refine the typography and image treatment.

The hero should feel like a campaign advertisement.

21. HERO TYPOGRAPHY

Use:

Small label

Inter:

THE ART OF
Main heading

Gilda Display:

चिकनकारी

or an appropriate English/Hindi combination.

Supporting copy

Inter:

Discover the delicate artistry of Chikankari, thoughtfully crafted for the modern woman.

Do not overcrowd the hero.

22. HERO CTA

Primary:

SHOP CHIKANKARI →

Secondary:

EXPLORE COLLECTION

The pink button:

#E694AA

can remain.

But make it slightly more sophisticated.

Avoid huge pill buttons.

Use a restrained radius.

23. NAVIGATION

Keep the navigation minimal.

The current structure is good:

HOME
SHOP
OUR STORY

Logo

SEARCH
ACCOUNT
WISHLIST
CART

Improve spacing and typography.

Use:

Inter
warm cream background
thin bottom border
no giant shadow
subtle hover transitions
24. LOGO

The logo should remain the central visual anchor.

Use the existing Resham Chikankari branding.

Do not make it excessively large.

The logo should feel like a fashion label.

25. ANNOUNCEMENT BAR

Keep the black announcement bar.

However, make it feel intentional.

Example:

FREE SHIPPING ON ORDERS OVER ₹4000
     •
USE CODE "DIWALI15"

Use Inter.

Small typography.

Do not allow the announcement bar to visually dominate the page.

26. SECTION TRANSITIONS

Do not abruptly switch:

WHITE
↓
GREEN

Instead create soft transitions.

Possible:

botanical divider
curved organic image boundary
overlapping editorial image
subtle texture transition
negative space

The page should feel art-directed.

27. COLLECTION SECTION

Create a major collection presentation.

Example:

             OUR COLLECTION

        Crafted for every occasion.


      [ IMAGE ]     [ IMAGE ]

      Everyday      Festive

      [ IMAGE ]     [ IMAGE ]

      Chikankari    New Arrivals

Use large images rather than tiny category cards.

28. CATEGORY CARDS

Category cards should behave like editorial tiles.

Not:

┌────────┐
│ image  │
├────────┤
│ title  │
└────────┘

Instead:

┌─────────────────────┐
│                     │
│       IMAGE         │
│                     │
│                     │
│     CHIKANKARI      │
│         →           │
└─────────────────────┘

Text can overlay the image if the photograph has enough negative space.

29. STORY SECTION

Introduce a large editorial section:

THE ART OF HANDCRAFT

Every stitch carries a story.

[Large image]

Discover the craft behind
Resham Chikankari.

This is where the brand should feel different from ordinary ecommerce.

30. IMAGE + TEXT COMPOSITIONS

Avoid putting every image inside a card.

Use full-bleed or large editorial images.

Example:

IMAGE IMAGE IMAGE
IMAGE IMAGE IMAGE
          TEXT

or:

TEXT        IMAGE
TEXT        IMAGE
TEXT        IMAGE

Use asymmetry.

31. ASYMMETRICAL LAYOUTS

Use controlled asymmetry inspired by fashion magazines.

Example:

                IMAGE
                IMAGE

TEXT
TEXT
TEXT

rather than:

IMAGE IMAGE IMAGE IMAGE
TEXT  TEXT  TEXT  TEXT

This is one of the easiest ways to remove the "template ecommerce" appearance.

32. WHITESPACE

Increase whitespace significantly.

The current interface feels slightly compressed.

Use:

large section padding
generous margins
breathing room around headings
whitespace between image and text
whitespace around editorial compositions

Premium fashion websites need space.

33. PRODUCT GRID WIDTH

Do not stretch product cards across the entire viewport.

Use a controlled content width.

Example:

max-width: 1400px

with generous side margins.

On very large screens, preserve the editorial composition instead of creating enormous cards.

34. MOBILE PRODUCT GRID

On mobile:

Use 2 columns only when imagery remains large enough.

Otherwise:

Use horizontally scrollable editorial products.

Avoid tiny product cards.

Product photography is the priority.

35. MOBILE SAGE SECTION

The sage section should remain full-width.

Do not put it inside a rounded mobile container.

It should feel like an immersive section.

36. REMOVE EXCESSIVE ROUNDED CORNERS

This is important.

The current product cards have very rounded corners.

Reduce this dramatically.

Use:

almost square image presentation
small radius where needed
larger radius only for selected campaign images

The website should feel more editorial and tactile.

37. CARD BACKGROUND

Preferred:

transparent

Secondary:

#FFF9F4

Only use a solid card background when required for readability.

Never default every product card to white.

38. WISHLIST

Wishlist should be a small elegant heart icon.

Place it:

top-right of product image
or reveal it on hover

Use a thin-line icon.

Selected state:

#E694AA

Do not use giant red hearts.

39. PRICE DESIGN

Price should remain subtle.

Example:

Gulabo Chikankari Kurti
₹1,899

Sale:

₹1,599   ₹1,899

Do not use aggressive discount badges.

40. PRODUCT BADGES

If needed:

NEW
BESTSELLER
SALE

Use very small editorial labels.

Example:

NEW ARRIVAL

rather than:

🔥 50% OFF!!!

Keep the brand premium.

41. FOOTER

The footer should continue the visual story.

Potentially use:

#3F5031

with subtle damask texture.

Cream typography.

Botanical decoration.

Sections:

SHOP
CUSTOMER CARE
ABOUT
POLICIES
SOCIAL
CONTACT

42. PAGE-WIDE VISUAL RHYTHM

The homepage should follow something like:

BLACK ANNOUNCEMENT BAR

CREAM / DAMASK NAVIGATION

LARGE HERO IMAGE

SAGE NEW ARRIVALS
    ↓
EDITORIAL PRODUCTS

CREAM STORY SECTION
    ↓
LARGE IMAGE + TEXT

SAGE COLLECTION SECTION
    ↓
EDITORIAL CATEGORY TILES

CREAM FEATURED CAMPAIGN
    ↓
LARGE IMAGE

SAGE / DAMASK NEWSLETTER

SAGE FOOTER

This creates a deliberate visual rhythm.

43. DO NOT OVERDECORATE

The goal is not:

"Add flowers everywhere."

The goal is:

"Create a subtle visual language inspired by Indian textile craftsmanship."

Use decoration approximately like seasoning.

If every section has:

flowers
patterns
borders
ornaments
textures

then nothing feels special.

44. COLORS

Primary:

#FFF9F4

Primary text:

#000000

Primary editorial green:

#3F5031

Accent:

#E694AA

Secondary botanical/heritage tones may be derived from these.

Do NOT introduce:

neon green
bright purple
bright red
generic blue
pure white backgrounds throughout the site
45. TYPOGRAPHY

Use:

Gilda Display

For:

hero
major headings
collection names
editorial statements
Inter

For:

navigation
product names
prices
buttons
metadata
forms
checkout

The typography should have a strong contrast between:

heritage elegance

and

modern usability.

46. TEXTURE RULE

Texture must always remain secondary.

At 100% opacity:

NO.

At subtle opacity:

YES.

The user should first see:

product
model
typography
CTA

Only afterward should they notice:

texture
botanical details
47. ACCESSIBILITY

Do not sacrifice readability for aesthetics.

Test:

black on cream
cream on sage
pink on cream
cream on sage
black on pink

Maintain clear keyboard focus.

Images require meaningful alt text.

Buttons must have sufficient touch targets.

48. PERFORMANCE

Do not implement the aesthetic using expensive effects.

Avoid:

huge WebGL backgrounds
continuous animation loops
excessive blur filters
massive background images without optimization
dozens of animated DOM elements

Use:

optimized WebP/AVIF
CSS backgrounds
CSS transitions
Next.js Image
lazy loading
minimal animation

The site must remain fast on mobile Indian networks.

49. RESPONSIVE DESIGN

Desktop:

Editorial and spacious.

Tablet:

Preserve composition while reducing whitespace.

Mobile:

Prioritize:

product
typography
CTA
navigation

Do not simply shrink desktop.

Recompose sections for mobile.

50. FINAL DESIGN TEST

Before considering the redesign complete, compare the website against this question:

Does it look like a fashion brand?

Not:

"Does it look like a nice ecommerce website?"

The correct answer must be:

"It looks like a premium Indian fashion editorial catalogue with ecommerce built into it."

51. SPECIFIC CHANGES TO THE CURRENT SCREENSHOT

For the current implementation shown in the reference, make these changes immediately:

REMOVE
white product containers
thick white card borders
excessive rounded card corners
generic ecommerce card shadows
excessive empty white blocks
overly uniform product cards
KEEP
hero photography
black announcement bar
cream navigation
Resham Chikankari logo
sage collection section
pink CTA
Gilda Display editorial typography
product photography
ADD
#3F5031 sage background
subtle damask texture
transparent editorial product cards
larger portrait product images
botanical line-art
editorial dividers
asymmetric product layouts
featured product compositions
more whitespace
subtle image hover effects
better collection storytelling
fashion-catalogue style category sections
52. MOST IMPORTANT CARD TRANSFORMATION

Transform this:

┌─────────────────────────┐
│                         │
│      WHITE CARD         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │ PRODUCT IMAGE   │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘

into this:

          NEW ARRIVALS

       ─────── ✦ ───────


     ┌─────────────┐
     │             │
     │             │
     │   PRODUCT   │
     │   IMAGE     │
     │             │
     │             │
     └─────────────┘

     Gulabo Kurti
     ₹1,899

where the image itself is the visual card, not a white box surrounding it.

And occasionally:

        ┌──────────────────┐
        │                  │
        │   FEATURED       │
        │   PRODUCT        │
        │                  │
        │                  │
        └──────────────────┘

       THE CHIKANKARI EDIT
53. FINAL ART-DIRECTION STATEMENT

The final site should combine:

Indian heritage
+
Chikankari craftsmanship
+
modern editorial fashion
+
warm cream damask
+
deep sage #3F5031
+
soft pink #E694AA
+
Gilda Display
+
Inter
+
large fashion photography
+
botanical ornamentation
+
asymmetrical magazine layouts
+
minimal ecommerce UI

The result should feel handcrafted, expensive, warm, feminine, editorial and distinctly Indian, while still being extremely easy to browse, add products to cart, checkout, and purchase.

CRITICAL RULE

Do not solve the redesign by adding more cards, shadows, gradients, rounded rectangles, or generic UI components.

Instead, remove visual containers and let:

photography + typography + texture + whitespace + color

create the design.

The user should never think:

"This is a WooCommerce replacement."

They should think:

"This is a fashion brand."