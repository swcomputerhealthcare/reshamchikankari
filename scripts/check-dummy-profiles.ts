import { db } from "@/db";
import { profiles } from "@/db/schema/auth";

async function main() {
  const allProfiles = await db.select().from(profiles);
  console.log("Current profiles in DB:", allProfiles.map(p => ({
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    role: p.role,
    createdAt: p.createdAt
  })));
  process.exit(0);
}

main().catch(err => {
  console.error("Error inspecting profiles:", err);
  process.exit(1);
});
