import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const { db } = await import("@/db");
  const { profiles } = await import("@/db/schema/auth");
  const { or, like, eq } = await import("drizzle-orm");

  const deleted = await db.delete(profiles).where(
    or(
      eq(profiles.email, "guest@user.com"),
      like(profiles.email, "%@example.com"),
      like(profiles.email, "authtest%"),
      like(profiles.email, "guest_%")
    )
  ).returning();

  console.log("Deleted dummy profiles:", deleted.map(p => ({ email: p.email, name: p.fullName })));
  
  const remaining = await db.select().from(profiles);
  console.log("\nRemaining real profiles in DB:", remaining.map(p => ({ email: p.email, name: p.fullName, role: p.role })));
  process.exit(0);
}

main().catch(err => {
  console.error("Failed to clean dummy profiles:", err);
  process.exit(1);
});
