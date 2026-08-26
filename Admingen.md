ROLE

Act as a senior product designer + senior Next.js engineer + Supabase architect.

Build a fully functional, production-ready Admin Dashboard for Resham Chikankari, an editorial luxury Chikankari fashion ecommerce website.

The existing customer-facing website is already built.

Do NOT redesign or break the existing storefront.

The admin panel is an internal management system that controls the data displayed on the main website.

The reference image supplied by the user is the structural inspiration for the dashboard layout:

left sidebar
dashboard overview
KPI cards
revenue/order/customer statistics
charts
product management
clean tables
settings

However, do NOT copy the visual design literally.

The admin must use the existing Resham Chikankari visual identity.

1. EXISTING BRAND

The main website uses:

Primary sage
#3F5031
Background

The website uses the existing public/images/bg.jpg decorative background.

It is a 16:9 editorial/damask-style background.

Use it carefully in the admin UI.

Do NOT put the background behind dense tables where readability suffers.

Use:

warm off-white surfaces
sage accents
subtle borders
black typography
muted beige
extremely subtle decorative patterns

The admin should feel like:

luxury fashion house × editorial catalogue × modern SaaS dashboard

Not:

generic Shopify clone

2. CRITICAL RULE — DO NOT BREAK EXISTING WEBSITE

Before making changes:

Inspect the existing project.

Understand:

app/
components/
lib/
public/
supabase/
catalog/
auth/
cart/
wishlist/

and whatever structure already exists.

Do NOT create duplicate:

authentication systems
product models
catalog systems
Supabase clients
database schemas
API routes
product data

Reuse the existing architecture wherever possible.

If an existing implementation already solves something correctly, extend it instead of replacing it.

3. ADMIN URL

Create:

/admin

with nested routes such as:

/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/orders
/admin/orders/[id]
/admin/customers
/admin/reviews
/admin/coupons
/admin/media
/admin/analytics
/admin/seo
/admin/settings

Only authenticated authorized administrators can access these routes.

4. ADMIN AUTHENTICATION

Use the existing Supabase authentication system.

Do NOT create another authentication provider.

Google OAuth is already configured for the website.

Admin authentication should work through the existing Supabase Auth session.

IMPORTANT

Do NOT use this:

if (email === "admin@gmail.com")

as the only security mechanism.

Instead create a proper administrator authorization mechanism.

Recommended structure:

profiles

or a dedicated:

admin_users

table.

Example:

admin_users
----------------
id
user_id
email
role
is_active
created_at
updated_at

Roles:

super_admin
admin
editor

For the current client setup, initially allow only the explicitly approved Gmail account.

The approved email should be configurable through environment/config/database rather than hardcoded throughout the application.

5. SECURITY

This is extremely important.

The UI must NOT be the security layer.

Implement:

Supabase RLS

Administrators can:

SELECT
INSERT
UPDATE
DELETE

only where authorized.

Normal customers must never be able to access admin data.

Customers must never be able to:

modify products
modify prices
modify stock
create fake reviews
modify orders
modify coupons
access customer lists
access analytics
access admin settings

Never expose:

SUPABASE_SERVICE_ROLE_KEY

to the browser.

Never put privileged Supabase operations inside client components.

Use server-side/server actions/API routes where privileged operations are necessary.

6. ADMIN LAYOUT

Create a persistent desktop sidebar.

Sidebar

Logo:

RC
Resham Chikankari

Navigation:

Overview
Products
Categories
Orders
Customers
Reviews
Coupons
Media
Analytics
SEO
Settings

Bottom:

View Store
Admin Profile
Sign Out

Keep the sidebar extremely clean.

No unnecessary icons everywhere.

Use a consistent icon library such as Lucide.

Do NOT use emojis.

7. MOBILE ADMIN

The admin must also work on mobile.

Desktop:

Sidebar + content

Tablet:

collapsible sidebar

Mobile:

top navigation
hamburger
bottom/slide navigation

Tables must become horizontally scrollable or transform into cards.

Never allow the entire website to overflow horizontally.

8. DASHBOARD OVERVIEW

/admin

Create an elegant dashboard.

Top:

Good evening

Here's what's happening with Resham Chikankari.

Then KPI cards.

Cards
Revenue
₹XX,XXX
+X.X%
Orders
XXX
+X.X%
Customers
XXX
+X.X%
Average Order Value
₹X,XXX
+X.X%

Do NOT hardcode fake statistics.

Everything must come from the database.

If there is insufficient data, show:

₹0
No data yet

instead of fabricated values.

9. REVENUE GRAPH

Create a clean revenue chart.

Filters:

7 days
30 days
90 days
This year

Show:

Revenue
Orders

Use a minimal line chart.

Avoid heavy gradients.

Avoid unnecessary animations.

Chart must remain responsive.

10. TOP PRODUCTS

Create a section:

Top Products

Display:

Rank
Product
Units Sold
Revenue

Example:

01
RC Dalby Straight Kurti
42 sold
₹83,958

Data must come from actual order records.

11. RECENT ORDERS

Show latest orders.

Columns:

Order
Customer
Date
Items
Amount
Status

Example:

#RC1024
Satyajit
24 Aug
2 items
₹3,198
Paid

Clicking an order opens:

/admin/orders/[id]
12. PRODUCTS MANAGEMENT

This is one of the most important sections.

Route:

/admin/products

Display a clean product table/grid.

Columns:

Image
Product
SKU
Category
Price
Stock
Status
Actions

Actions:

Edit
Duplicate
Archive
Delete

Do NOT immediately delete without confirmation.

Use:

Archive

for safer product management.

13. ADD PRODUCT

Create:

/admin/products/new

Fields:

Product name
Product number
SKU
Description
Category
Price
Compare-at price
Fabric
Color
Care instructions

Then:

Product images

Allow multiple images.

Images should preserve their original aspect ratio.

NEVER:

object-fit: cover

if it crops the actual garment.

Prefer:

object-fit: contain

inside the brand's image presentation system.

The product photography should remain completely visible.

14. PRODUCT VARIANTS

Products need variants.

Example:

Size
S
M
L
XL
XXL

Each variant should have:

size
SKU
stock
availability

Admin can toggle:

Available
Unavailable

This should immediately affect the customer-facing website.

For example:

XL — Available
XXL — Unavailable

The storefront should prevent customers from selecting unavailable variants.

15. PRODUCT AVAILABILITY

Create a very fast inventory interface.

Example:

RC Muslin Co-ord Set

S     Available
M     Available
L     Available
XL    Available
XXL   Unavailable

Allow:

Toggle availability

without requiring the administrator to edit the entire product.

Optimistic UI:

click → instantly changes UI
       ↓
database update

If database update fails:

rollback UI
show error

Do NOT reload the entire page.

16. PRODUCT DATA FROM EXISTING CATALOG

The existing project already contains product/catalog information.

DO NOT duplicate product data into another independent system.

If the existing:

products
product_variants
product_images
categories

tables are already present, use them.

The admin panel should become the management interface for the existing catalog.

17. PRODUCT IMAGES

Use the existing product-image architecture.

The existing folder structure includes nested folders under:

reshamchikankari/
New folder/
New folder (2)/

Do not arbitrarily move or rename existing assets.

Create a clean relationship:

product
   ↓
product_images
   ↓
image URL

Each image should have:

id
product_id
url
alt_text
sort_order
is_primary
created_at

Allow admin to:

upload
remove
reorder
set primary image
18. CATEGORIES

Create:

/admin/categories

Allow:

Create category
Edit category
Delete/archive category
Reorder categories

Examples:

Kurtis
Co-ord Sets
Plazzos
New Arrivals
Best Sellers

Products should be assignable to categories.

19. REVIEWS

Create:

/admin/reviews

This must be fully functional.

Show:

Customer
Product
Rating
Review
Date
Status

Statuses:

Pending
Approved
Rejected

Admin actions:

Approve
Reject
Delete

Only approved reviews should appear on the storefront.

20. ADD REVIEW FROM ADMIN

Allow the admin to manually create a review.

Fields:

Customer name
Product
Rating
Review text
Date
Verified purchase
Status

This is useful for importing existing customer testimonials.

Do NOT fabricate reviews automatically.

21. ORDERS

Create:

/admin/orders

Filters:

All
Pending
Paid
Processing
Shipped
Delivered
Cancelled
Refunded

Order details:

Order ID
Customer
Items
Quantity
Price
Subtotal
Discount
Shipping
Total
Payment status
Fulfillment status
Shipping address
Created date

Admin should be able to update order status.

22. CUSTOMER MANAGEMENT

Create:

/admin/customers

Display:

Name
Email
Orders
Total spent
Last order
Joined

Click customer → customer detail page.

Show:

Order history
Wishlist
Reviews
Wallet/refund balance

Do NOT expose unnecessary sensitive information.

23. COUPONS

Create:

/admin/coupons

Admin can create:

Coupon code
Discount type
Percentage
Fixed amount
Minimum order
Maximum discount
Expiry date
Usage limit
Active/inactive

Example:

DIWALI15
15% OFF
Minimum ₹2,000
Maximum discount ₹500

Validate everything server-side.

Never trust discount calculations from the client.

24. RC WALLET

The website already has the concept of an:

RC Wallet

Admin should be able to view wallet/refund balances.

However:

IMPORTANT

Wallet balance must NEVER be directly editable without an auditable transaction.

Create a wallet ledger.

Example:

wallet_transactions

id
user_id
order_id
type
amount
reason
created_at
created_by

Types:

refund
withdrawal
adjustment

Every admin adjustment must create a ledger entry.

Never simply:

wallet.balance = 5000

without recording why.

25. MEDIA LIBRARY

Create:

/admin/media

Display all uploaded product/media assets.

Allow:

Upload
Delete
Search
Filter
Copy URL
Assign to product

Use the existing Cloudinary architecture if it is configured.

Do not expose Cloudinary secrets to the browser.

26. ANALYTICS

Create:

/admin/analytics

Useful metrics:

Revenue
Orders
Conversion rate
Average order value
Top products
Top categories
Returning customers
New customers

Date filters:

7D
30D
90D
1Y

Do not over-engineer this initially.

Build the data layer so additional analytics can be added later.

27. SEO

Create:

/admin/seo

Allow editing:

Homepage title
Homepage description
OG title
OG description
OG image

Product SEO:

SEO title
SEO description
canonical slug

Do not allow admins to accidentally break URLs without warning.

If slug changes:

show warning
28. SITE SETTINGS

Create:

/admin/settings

Sections:

Store
Store name
Contact email
Phone
Address
Shipping
Free shipping threshold
Shipping fee
Orders
Order settings
Homepage
Hero content
Announcement bar
Social
Instagram
Facebook
29. REAL-TIME WEBSITE SYNCHRONIZATION

This is critical.

When admin changes:

product
price
availability
image
review
category

the main website should reflect the change.

Do not require the client to manually redeploy the site.

Use the existing Supabase architecture and appropriate:

cache invalidation
revalidation
Supabase Realtime
server-side fetching

where appropriate.

For example:

Admin changes XXL → unavailable
            ↓
Supabase
            ↓
cache/revalidation
            ↓
Storefront
            ↓
XXL unavailable
30. PERFORMANCE

The existing website has already been optimized for smooth cart operations.

Apply the same philosophy to the entire admin.

NEVER refresh the entire page for:

delete
edit
availability toggle
approve review
archive product
coupon activation

Use:

optimistic updates
server actions/API mutations
React state updates
targeted cache invalidation

Example:

Admin clicks "Unavailable"

UI updates immediately.

Request runs in background.

Success:
keep new state.

Failure:
rollback state + toast error.
31. NO FULL PAGE RELOADS

Avoid:

window.location.reload()

unless absolutely necessary.

Avoid unnecessary:

router.refresh()

after every tiny mutation.

Instead invalidate only the affected data.

Example:

Product updated

should not cause:

entire dashboard
entire navigation
entire product list

to unnecessarily re-render.

32. LOADING STATES

Never show a blank screen.

Use elegant skeletons.

Examples:

Product table skeleton
Dashboard card skeleton
Chart skeleton
Review skeleton

Keep transitions extremely fast.

33. ERROR HANDLING

Every mutation needs proper error handling.

Example:

Failed to update availability.

Please try again.

Never expose raw:

Supabase error
SQL error
stack trace

to administrators.

Log technical errors appropriately.

34. CONFIRMATION UX

For destructive operations:

Delete product?

Show:

This action cannot be easily undone.

Prefer:

Archive product

over permanent deletion whenever possible.

For deleting:

Type DELETE

only for truly destructive operations if appropriate.

35. TOAST SYSTEM

Use elegant minimal notifications.

Examples:

Product updated
Availability changed
Review approved
Coupon activated
Product archived

Do NOT use browser:

alert()

Do NOT use emojis.

Use a consistent toast component.

36. DESIGN SYSTEM

Admin UI should match the storefront.

Colors
Sage:
#3F5031

Primary:
#111111

Warm background:
#F8F4EF

Card:
#FFFDF9

Muted:
#77736D

Border:
rgba(17,17,17,0.12)

Use the actual existing CSS variables if they already exist.

Do not create duplicate theme variables if the project already has a design system.

37. TYPOGRAPHY

Use the same typography hierarchy as the storefront.

Editorial serif for:

large headings
page titles
important sections

Clean grotesk/sans-serif for:

tables
buttons
metadata
navigation
forms

This creates the:

editorial fashion × modern commerce

feeling.

38. ADMIN DASHBOARD SHOULD NOT LOOK OVER-DESIGNED

Avoid:

giant gradients
excessive shadows
glassmorphism everywhere
neon colors
excessive rounded cards
giant icons
animated charts
excessive motion

The dashboard should feel expensive because of:

spacing
alignment
typography
hierarchy
whitespace
consistency
39. MICRO-INTERACTIONS

Use subtle:

150–250ms

transitions.

Examples:

sidebar hover
button hover
table row hover
dropdown
modal
toast
status toggle
image reorder

GSAP/Framer Motion can be used sparingly.

Do NOT animate data-heavy tables excessively.

40. RESPONSIVE ADMIN TABLES

Desktop:

full table

Mobile:

product card

For example:

┌──────────────────────────────┐
│ [image]                      │
│ RC Dalby Straight Kurti      │
│ ₹1,599                       │
│                              │
│ Stock       Available        │
│ SKU         RC-008           │
│                              │
│ Edit              ⋯          │
└──────────────────────────────┘
41. ADMIN PRODUCT EDITOR

Make the editor visually organized.

Use sections:

GENERAL
────────────────
Product name
Description
Category

PRICING
────────────────
Price
Compare price

INVENTORY
────────────────
SKU
Variants
Availability

MEDIA
────────────────
Images

DETAILS
────────────────
Fabric
Color
Care

SEO
────────────────
Meta title
Meta description
Slug

Do not put 30 fields into one giant form.

42. UNSAVED CHANGES

If the admin edits a product and navigates away:

Show:

You have unsaved changes.

Leave page?

Only when actual changes exist.

43. ADMIN ACCESS DENIED PAGE

If an authenticated user does not have admin privileges:

Create a minimal page:

ACCESS RESTRICTED

You don't have permission to access the Resham Chikankari administration.

Return to store

Do not reveal whether a particular email is or isn't an administrator.

44. UNAUTHENTICATED ADMIN ACCESS

If someone visits:

/admin

without authentication:

redirect to the existing login flow.

After successful admin login:

/admin

Do not send them to the storefront unless necessary.

45. DATABASE

First inspect the existing Supabase database.

Existing tables may include:

addresses
categories
coupons
hero_slides
media
order_items
order_timeline
orders
page_seo
product_images
product_option_values
product_options
product_variants
products
profiles
reviews
seo_settings
site_settings
subscribers

Do not blindly recreate these tables.

Determine what already exists.

Extend existing tables where appropriate.

Only create missing tables.

46. MIGRATION SAFETY

Before changing the schema:

Inspect existing schema.
Identify dependencies.
Create migration.
Apply migration.
Verify RLS.
Test storefront.
Test admin.
Run TypeScript.
Run build.

Never destroy existing production data.

Never use destructive migrations casually.

47. DATA RELATIONSHIPS

Maintain clean relationships:

profiles
   │
   ├── orders
   │      └── order_items
   │               └── products
   │
   ├── reviews
   │
   └── wallet_transactions


products
   │
   ├── product_images
   ├── product_variants
   ├── product_options
   └── categories

Do not duplicate product information in multiple unrelated places.

48. AUDIT LOG

For important admin actions, maintain an audit trail.

Example:

admin_activity

id
admin_id
action
entity_type
entity_id
metadata
created_at

Actions:

PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_ARCHIVED
PRICE_CHANGED
STOCK_CHANGED
REVIEW_APPROVED
REVIEW_REJECTED
ORDER_STATUS_CHANGED
COUPON_CREATED
WALLET_ADJUSTED

This is particularly important for financial/order operations.

49. DASHBOARD QUICK ACTIONS

Add a subtle quick action area:

+ Add Product

Update Availability

Review Pending Reviews

View Orders

These should be genuinely functional.

50. EMPTY STATES

Never show ugly blank tables.

Example:

No products yet

Your product catalogue will appear here.

+ Add your first product

Use subtle editorial decorative elements where appropriate.

51. DO NOT USE EMOJIS

Replace generic emojis with:

Lucide icons

Examples:

Package
ShoppingBag
Users
Star
Tag
Image
BarChart3
Settings
Search
Plus
Trash2
Pencil
Eye
Check
X
ChevronDown

Keep icons small and understated.

52. ACCESSIBILITY

Implement:

keyboard navigation
focus states
ARIA labels
proper form labels
semantic buttons
accessible dialogs
accessible dropdowns

Color must never be the only indication of status.

For example:

● Available
○ Unavailable

with text.

53. PERFORMANCE ARCHITECTURE

Use:

Server Components

for read-heavy dashboard pages where appropriate.

Use:

Client Components

only for interactive pieces.

Do not turn the entire dashboard into:

"use client"

unless necessary.

Use:

dynamic imports
lazy loading
pagination
debounced search
server-side filtering

for large datasets.

54. PRODUCT SEARCH

Admin product search should support:

name
SKU
product number
category

Search should be debounced.

Do not query Supabase on every keystroke.

55. PAGINATION

Never load thousands of products/orders at once.

Use pagination.

Example:

20 / page
50 / page
100 / page

with:

Previous
1
2
3
Next
56. FINAL QUALITY CHECK

After implementation run:

npm run typecheck
npm run lint
npm run build

Fix ALL errors.

Especially do not introduce the type errors currently happening in:

lib/catalog/index.ts

Do not casually change the CatalogProduct interface just to silence TypeScript.

If fields such as:

createdAt
updatedAt

are required, properly populate them or correctly derive them from the database.

Do NOT solve errors with:

as any

or:

// @ts-ignore
57. TEST THE COMPLETE FLOW

Test this exact sequence:

Admin
Google Login
↓
Supabase session
↓
Admin authorization
↓
/admin
Product
Add Product
↓
Save
↓
Product appears in database
↓
Product appears on storefront
Availability
Admin disables XL
↓
Database updates
↓
Storefront updates
↓
XL cannot be purchased
Price
Admin changes price
↓
Database
↓
Storefront
↓
Product page
↓
Cart
↓
Checkout
Review
Admin approves review
↓
Database
↓
Storefront review section
Delete/archive
Admin archives product
↓
Product disappears from active catalogue
↓
Existing order history remains intact
58. MOST IMPORTANT PRINCIPLE

The admin panel is not a separate website.

It is the management layer for the existing Resham Chikankari ecommerce application.

The architecture should be:

                 SUPABASE
                    │
        ┌───────────┴───────────┐
        │                       │
   ADMIN PANEL              STOREFRONT
        │                       │
        └───────────┬───────────┘
                    │
                 SAME DATA

Therefore:

Admin changes must automatically become storefront changes.

There must be one source of truth.

Do not create:

adminProducts
websiteProducts

or duplicated JSON catalogues.

59. IMPLEMENTATION ORDER

Do this in phases.

PHASE 1

Audit existing architecture and Supabase schema.

PHASE 2

Admin authentication + authorization.

PHASE 3

Admin shell/sidebar/navigation.

PHASE 4

Dashboard overview.

PHASE 5

Products + variants + availability.

PHASE 6

Media management.

PHASE 7

Orders.

PHASE 8

Reviews.

PHASE 9

Customers.

PHASE 10

Coupons.

PHASE 11

RC Wallet.

PHASE 12

Analytics.

PHASE 13

SEO + site settings.

PHASE 14

Responsive optimization.

PHASE 15

Performance optimization.

PHASE 16

Security/RLS audit.

PHASE 17

Final build/typecheck/lint/testing.

FINAL INSTRUCTION TO THE AI

Do not rush into generating files.

First inspect the existing codebase and Supabase schema.

Then produce a short implementation plan identifying:

Existing tables that can be reused
Tables that are missing
Existing authentication implementation
Existing product/catalog implementation
Existing caching/revalidation implementation
Existing design system
Existing routes
Potential conflicts

Then implement the admin panel incrementally.

Do not overwrite working storefront functionality.

Do not duplicate existing systems.

Do not introduce fake data.

Do not use any to bypass TypeScript errors.

Do not use emojis.

Do not use full-page reloads for CRUD operations.

Do not expose service-role credentials.

Do not rely on client-side admin checks for security.

The final result should feel like a premium internal control room for Resham Chikankari, while remaining visually consistent with the existing editorial storefront.