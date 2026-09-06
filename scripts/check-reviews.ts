import { db } from "@/db";
import { reviews } from "@/db/schema/review";

async function main() {
  const allReviews = await db.select().from(reviews);
  console.log("Current reviews in DB:", allReviews);
  process.exit(0);
}

main().catch(err => {
  console.error("Error inspecting reviews:", err);
  process.exit(1);
});
