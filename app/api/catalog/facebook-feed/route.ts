import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const { products } = await getProducts({ limit: 1000 });
    const baseUrl = "https://www.reshamchikankari.com";

    const itemsXml = products
      .filter((product) => product.isActive !== false)
      .map((product) => {
        const primaryImage =
          product.images?.find((img) => img.isPrimary)?.imageUrl ||
          product.images?.[0]?.imageUrl ||
          "/images/about.png";

        const absoluteImageUrl = primaryImage.startsWith("http")
          ? primaryImage
          : `${baseUrl}${primaryImage}`;

        const productUrl = `${baseUrl}/product/${product.slug}`;

        const cleanDescription = product.description
          ? product.description.replace(/\s+/g, " ").trim()
          : `Authentic ${product.name} hand-embroidered by Lucknow artisans on fine ${product.fabric || "cotton / georgette"}.`;

        const priceInInr = (product.pricePaise / 100).toFixed(2);

        const inStock = product.variants && product.variants.length > 0
          ? product.variants.some((v) => (v.inventoryQuantity ?? 0) > 0 || v.isAvailable)
          : true;

        const availability = inStock ? "in stock" : "out of stock";

        return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${cleanDescription}]]></g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(absoluteImageUrl)}</g:image_link>
      <g:brand>Resham Chikankari</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceInInr} INR</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing</g:google_product_category>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Resham Chikankari Product Catalog</title>
    <link>${baseUrl}</link>
    <description>Authentic Handcrafted Lucknowi Chikankari Kurtis and Suits</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to generate Meta catalog feed:", error);
    return new NextResponse("Failed to generate catalog feed", { status: 500 });
  }
}
