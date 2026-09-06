import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import postgres from "postgres";

async function testCounts() {
  const sql = postgres(process.env.DATABASE_URL!, { connect_timeout: 5 });
  try {
    const productsCount = await sql`SELECT count(*) FROM products`.catch(e => e.message);
    const ordersCount = await sql`SELECT count(*) FROM orders`.catch(e => e.message);
    const reviewsCount = await sql`SELECT count(*) FROM reviews`.catch(e => e.message);
    const couponsCount = await sql`SELECT count(*) FROM coupons`.catch(e => e.message);
    const settingsCount = await sql`SELECT count(*) FROM site_settings`.catch(e => e.message);
    const categoriesCount = await sql`SELECT count(*) FROM categories`.catch(e => e.message);

    console.log("DB Table Counts:");
    console.log("products:", productsCount);
    console.log("orders:", ordersCount);
    console.log("reviews:", reviewsCount);
    console.log("coupons:", couponsCount);
    console.log("site_settings:", settingsCount);
    console.log("categories:", categoriesCount);
  } finally {
    await sql.end();
  }
}

testCounts();
