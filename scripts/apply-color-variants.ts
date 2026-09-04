import fs from "fs";
import path from "path";

interface ColorDef {
  name: string;
  code: string;
  count: number;
}

const MULTI_COLOR_CONFIG: Record<string, { colors: ColorDef[]; sizes: string[] }> = {
  prod_rc_2: {
    colors: [
      { name: "Purple", code: "#B59FD9", count: 6 },
      { name: "Light Blue", code: "#A0C4E2", count: 6 },
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  prod_rc_3: {
    colors: [
      { name: "Lemon Yellow", code: "#FDE047", count: 6 },
      { name: "Peach Pink", code: "#FCA5A5", count: 6 },
      { name: "Sky Blue", code: "#93C5FD", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_4: {
    colors: [
      { name: "Baby Pink", code: "#F9A8D4", count: 6 },
      { name: "Mint Green", code: "#A7F3D0", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_8: {
    colors: [
      { name: "Yellow", code: "#FACC15", count: 6 },
      { name: "Peach", code: "#FB923C", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_10: {
    colors: [
      { name: "Lavender", code: "#C084FC", count: 6 },
      { name: "Rani Pink", code: "#EC4899", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_13: {
    colors: [
      { name: "Turquoise Blue", code: "#38BDF8", count: 6 },
      { name: "Black", code: "#1E293B", count: 6 },
      { name: "Beige", code: "#D4B996", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_14: {
    colors: [
      { name: "Black", code: "#1E293B", count: 6 },
      { name: "Olive Brown", code: "#78624E", count: 6 },
      { name: "Coral Pink", code: "#F87171", count: 6 },
    ],
    sizes: ["M", "L", "XL"],
  },
  prod_rc_15: {
    colors: [
      { name: "Turquoise Blue", code: "#38BDF8", count: 6 },
      { name: "Black", code: "#1E293B", count: 6 },
      { name: "Mauve Pink", code: "#C084FC", count: 6 },
    ],
    sizes: ["S", "M", "L"],
  },
  prod_rc_16: {
    colors: [
      { name: "Mustard Yellow", code: "#EAB308", count: 6 },
      { name: "Lavender", code: "#A855F7", count: 6 },
    ],
    sizes: ["S", "M", "L"],
  },
};

function updateProductList(products: any[]) {
  return products.map((p) => {
    // 1. Fix prod_rc_1 -> Revert to standard single color (no color variants)
    if (p.id === "prod_rc_1") {
      const standardVariants = ["S", "M", "L", "XL"].map((sz) => ({
        id: `var_rc_1_${sz.toLowerCase()}`,
        productId: "prod_rc_1",
        sku: `RC-SKU-1-${sz}`,
        name: sz,
        size: sz,
        colorName: null,
        colorCode: null,
        pricePaise: p.pricePaise || 259900,
        compareAtPricePaise: p.compareAtPricePaise || 319900,
        stock: sz === "XL" ? 6 : 12,
        inventoryQuantity: sz === "XL" ? 6 : 12,
        isActive: true,
        isAvailable: true,
      }));

      const images = p.images.map((img: any) => ({
        ...img,
        colorName: null,
      }));

      return {
        ...p,
        images,
        variants: standardVariants,
      };
    }

    // 2. Multi-color products
    const config = MULTI_COLOR_CONFIG[p.id];
    if (!config) {
      // Single-color products: ensure variants have size set if name matches size
      const variants = (p.variants || []).map((v: any) => ({
        ...v,
        size: v.size || (v.name && !v.name.includes("/") ? v.name : null),
        colorName: v.colorName ?? null,
        colorCode: v.colorCode ?? null,
      }));
      return {
        ...p,
        variants,
      };
    }

    // Tag images with corresponding colorName based on index ranges
    let imgIdx = 0;
    const taggedImages = p.images.map((img: any) => {
      let assignedColor: ColorDef | null = null;
      let runningCount = 0;
      for (const col of config.colors) {
        if (imgIdx >= runningCount && imgIdx < runningCount + col.count) {
          assignedColor = col;
          break;
        }
        runningCount += col.count;
      }
      imgIdx++;
      return {
        ...img,
        colorName: assignedColor ? assignedColor.name : null,
      };
    });

    // Generate variants for each color and size
    const newVariants: any[] = [];
    for (const col of config.colors) {
      for (const sz of config.sizes) {
        const slugColor = col.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const skuColor = col.name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 3);
        const szLower = sz.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        const szUpper = sz.toUpperCase().replace(/[^A-Z0-9]+/g, "");

        // Determine stock
        let stock = 12;
        if (sz === "XL" && col.name === "Light Blue" && p.id === "prod_rc_2") {
          stock = 0; // for out of stock testing
        } else if (sz === "S") {
          stock = 6;
        } else if (sz === "XL") {
          stock = 5;
        }

        newVariants.push({
          id: `var_${p.id.replace("prod_", "")}_${slugColor}_${szLower}`,
          productId: p.id,
          sku: `RC-SKU-${p.productNumber || p.id.replace("prod_rc_", "")}-${skuColor}-${szUpper}`,
          name: `${col.name} / ${sz}`,
          colorName: col.name,
          colorCode: col.code,
          size: sz,
          pricePaise: p.pricePaise,
          compareAtPricePaise: p.compareAtPricePaise,
          stock,
          inventoryQuantity: stock,
          isActive: true,
          isAvailable: true,
        });
      }
    }

    return {
      ...p,
      images: taggedImages,
      variants: newVariants,
    };
  });
}

// Process lib/catalog/index.ts
const catalogPath = path.join(process.cwd(), "lib", "catalog", "index.ts");
const catalogContent = fs.readFileSync(catalogPath, "utf-8");

const mockStart = catalogContent.indexOf("export const MOCK_PRODUCTS: CatalogProductInput[] = ");
const mockEnd = catalogContent.indexOf(";\n\n// Helper to determine if DB connection");

if (mockStart !== -1 && mockEnd !== -1) {
  const jsonStr = catalogContent.slice(
    mockStart + "export const MOCK_PRODUCTS: CatalogProductInput[] = ".length,
    mockEnd
  );
  const products = JSON.parse(jsonStr);
  const updatedProducts = updateProductList(products);

  const newCatalogContent =
    catalogContent.slice(0, mockStart + "export const MOCK_PRODUCTS: CatalogProductInput[] = ".length) +
    JSON.stringify(updatedProducts, null, 2) +
    catalogContent.slice(mockEnd);

  fs.writeFileSync(catalogPath, newCatalogContent, "utf-8");
  console.log("✅ Successfully updated lib/catalog/index.ts");
} else {
  console.error("❌ Could not locate MOCK_PRODUCTS bounds in lib/catalog/index.ts");
}

// Process db/seed.ts
const seedPath = path.join(process.cwd(), "db", "seed.ts");
const seedContent = fs.readFileSync(seedPath, "utf-8");

const seedStart = seedContent.indexOf("const productsList = ");
const seedEnd = seedContent.indexOf(";\n\nasync function main()");

if (seedStart !== -1 && seedEnd !== -1) {
  const jsonStr = seedContent.slice(seedStart + "const productsList = ".length, seedEnd);
  const products = JSON.parse(jsonStr);
  const updatedProducts = updateProductList(products);

  const newSeedContent =
    seedContent.slice(0, seedStart + "const productsList = ".length) +
    JSON.stringify(updatedProducts, null, 2) +
    seedContent.slice(seedEnd);

  fs.writeFileSync(seedPath, newSeedContent, "utf-8");
  console.log("✅ Successfully updated db/seed.ts");
} else {
  console.error("❌ Could not locate productsList bounds in db/seed.ts");
}
