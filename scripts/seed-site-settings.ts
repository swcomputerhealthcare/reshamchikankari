import { db } from "@/db";
import { siteSettings } from "@/db/schema/content";

async function main() {
  await db.insert(siteSettings).values({
    id: "global",
    storeName: "Resham Chikankari",
    storeEmail: "info@reshamchikankari.com",
    supportPhone: "+91 96259 40329",
    shippingThreshold: 4000,
    defaultCurrency: "INR",
    announcementBarText: "Free Shipping on Orders Above ₹4,000 | Handcrafted with Love in Lucknow",
    socialLinks: {
      instagram: "https://www.instagram.com/resham.chikankari/",
      whatsapp: "https://wa.me/919625940329"
    },
    maintenanceMode: false,
  }).onConflictDoUpdate({
    target: siteSettings.id,
    set: {
      storeName: "Resham Chikankari",
      storeEmail: "info@reshamchikankari.com",
      supportPhone: "+91 96259 40329",
      shippingThreshold: 4000,
      announcementBarText: "Free Shipping on Orders Above ₹4,000 | Handcrafted with Love in Lucknow",
    }
  });

  console.log("Seeded global site_settings successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding site_settings:", err);
  process.exit(1);
});
