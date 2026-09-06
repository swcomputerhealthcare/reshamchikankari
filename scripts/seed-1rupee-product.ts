import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const { db } = await import("@/db");
  const { products, productImages, productVariants } = await import("@/db/schema/catalog");
  const { eq } = await import("drizzle-orm");

  console.log("Seeding ₹1 test product into database...");

  const productId = "prod_test_1rupee";
  const slug = "razorpay-1-rupee-test-product";

  // Check if exists
  const existing = await db.select().from(products).where(eq(products.id, productId));
  if (existing.length > 0) {
    console.log("Updating existing ₹1 product...");
    await db.update(products).set({
      name: "Razorpay ₹1 Test Sample",
      slug: slug,
      pricePaise: 100,
      compareAtPricePaise: 199900,
      isActive: true,
      featured: true,
      updatedAt: new Date(),
    }).where(eq(products.id, productId));
  } else {
    console.log("Inserting new ₹1 product...");
    await db.insert(products).values({
      id: productId,
      categoryId: "cat_kurtis",
      name: "Razorpay ₹1 Test Sample",
      slug: slug,
      description: "Special ₹1 test sample created to verify end-to-end Razorpay payments, real-time receipt generation, and automatic Shiprocket order sync.",
      sku: "RC-TEST-1INR",
      pricePaise: 100,
      compareAtPricePaise: 199900,
      isActive: true,
      featured: true,
      fabric: "Mulmul Cotton",
      color: "Emerald Green",
      length: "Knee Length",
      neckline: "Round Neck",
      sleeves: "3/4 Sleeves",
      occasion: "Testing & Verification",
      washCare: "Hand Wash Cold",
      weightKg: 0.35,
      lengthCm: 25,
      breadthCm: 20,
      heightCm: 5,
      hsnCode: "6204",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Ensure image exists
  const existingImg = await db.select().from(productImages).where(eq(productImages.productId, productId));
  if (existingImg.length === 0) {
    console.log("Inserting image for ₹1 product...");
    await db.insert(productImages).values({
      id: "img_test_1rupee_1",
      productId: productId,
      url: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
      imageUrl: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
      publicId: "rc_test_1rupee_1",
      alt: "Razorpay ₹1 Test Sample",
      altText: "Razorpay ₹1 Test Sample",
      colorName: "Emerald Green",
      isPrimary: true,
      sortOrder: 0,
    });
  }

  // Ensure variants exist
  const existingVars = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  if (existingVars.length === 0) {
    console.log("Inserting variants for ₹1 product...");
    const sizes = ["S", "M", "L", "XL"];
    for (const size of sizes) {
      await db.insert(productVariants).values({
        id: `var_test_1rupee_${size.toLowerCase()}`,
        productId: productId,
        sku: `RC-TEST-1INR-${size}`,
        name: size,
        size: size,
        colorName: "Emerald Green",
        pricePaise: 100,
        compareAtPricePaise: 199900,
        stock: 999,
        inventoryQuantity: 999,
        isActive: true,
        isAvailable: true,
      });
    }
  }

  console.log("₹1 test product seeded successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to seed ₹1 product:", err);
  process.exit(1);
});
