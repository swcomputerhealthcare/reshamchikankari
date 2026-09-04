import { db } from "../db";
import { products, productVariants, productImages, categories } from "../db/schema/catalog";
import { eq } from "drizzle-orm";

async function seedTestProduct() {
  const isDbAvailable = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");
  if (!isDbAvailable) {
    console.log("Database connection string not configured or is template. ₹1 product is available in offline mock catalog.");
    process.exit(0);
  }

  try {
    const prodId = "prod_test_1rupee";
    const catId = "cat_kurtis";

    // Ensure category exists
    const [cat] = await db.select().from(categories).where(eq(categories.id, catId)).limit(1);
    if (!cat) {
      await db.insert(categories).values({
        id: catId,
        name: "Kurtis & Kurtas",
        slug: "kurtis-kurtas",
        description: "Kurtis category",
        sortOrder: 0,
        isActive: true,
      }).onConflictDoNothing();
    }

    // Upsert product
    await db.insert(products).values({
      id: prodId,
      categoryId: catId,
      name: "Razorpay ₹1 Test Product",
      slug: "razorpay-1-rupee-test-product",
      description: "Special ₹1 test product created to test end-to-end Razorpay payments, webhooks, and checkout flows.",
      sku: "RC-TEST-1INR",
      pricePaise: 100,
      compareAtPricePaise: 10000,
      fabric: "Mulmul Cotton",
      color: "Emerald Green",
      length: "Knee Length",
      neckline: "Round Neck",
      sleeves: "3/4 Sleeves",
      occasion: "Testing",
      washCare: "Hand Wash",
      featured: true,
      isActive: true,
      productNumber: 999,
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        pricePaise: 100,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // Upsert primary image
    await db.insert(productImages).values({
      id: "img_test_1rupee_1",
      productId: prodId,
      url: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
      imageUrl: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
      alt: "Razorpay ₹1 Test Product",
      altText: "Razorpay ₹1 Test Product",
      isPrimary: true,
      sortOrder: 0,
    }).onConflictDoNothing();

    // Upsert variant
    await db.insert(productVariants).values({
      id: "var_test_1rupee_std",
      productId: prodId,
      sku: "RC-TEST-1INR-STD",
      name: "Standard",
      pricePaise: 100,
      compareAtPricePaise: 10000,
      stock: 999,
      inventoryQuantity: 999,
      isActive: true,
      isAvailable: true,
    }).onConflictDoUpdate({
      target: productVariants.id,
      set: {
        pricePaise: 100,
        stock: 999,
        isAvailable: true,
        updatedAt: new Date(),
      },
    });

    console.log("Successfully seeded ₹1 test product into database!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding ₹1 test product:", err);
    process.exit(1);
  }
}

seedTestProduct();
