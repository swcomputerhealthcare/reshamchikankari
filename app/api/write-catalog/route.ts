import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Official 22 products availability details
const catalogInfo = [
  {
    num: 1,
    name: "RC Chanderi Sparkle set",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2599,
    comparePrice: 3199,
    cat: "coord-sets",
    fabric: "Chanderi Silk",
    color: "Peach Sparkle",
    length: "Knee Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive Wear",
    washCare: "Dry Clean Only",
    desc: "A luxurious Chanderi Silk co-ord set adorned with fine Lucknowi Chikankari embroidery and subtle sequins work, creating an elegant sparkle for special occasions."
  },
  {
    num: 2,
    name: "RC Cargo set",
    sizes: ["M", "L", "XL", "38 Blue", "40P"],
    avail: true,
    price: 3499,
    comparePrice: 3999,
    cat: "coord-sets",
    fabric: "Premium Cotton",
    color: "Indigo Blue",
    length: "Mid Calf",
    neckline: "Collar Neck",
    sleeves: "Full Sleeves",
    occasion: "Casual Wear",
    washCare: "Gentle Hand Wash",
    desc: "A contemporary fusion cargo set featuring practical pockets and exquisite hand-embroidered borders. Designed for comfort and modern utility."
  },
  {
    num: 3,
    name: "RC Chandni Short Kurti",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 1499,
    comparePrice: 1899,
    cat: "kurtis-kurtas",
    fabric: "Mulmul Cotton",
    color: "Ivory White",
    length: "Short",
    neckline: "V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Dailywear",
    washCare: "Gentle Hand Wash",
    desc: "A delicate short Kurti crafted in soft Mulmul cotton, adorned with classic Lucknowi floral patterns. Highly breathable and perfect for daily summer styling."
  },
  {
    num: 4,
    name: "RC Muslin Co-ord set",
    sizes: ["M", "L", "XL", "XXL"],
    unavailableSizes: ["XXL"],
    avail: true, // partially available
    price: 2999,
    comparePrice: 3599,
    cat: "coord-sets",
    fabric: "Muslin Silk",
    color: "Pastel Mint",
    length: "Below Knee",
    neckline: "Mandarin Collar",
    sleeves: "3/4 Sleeves",
    occasion: "Office / Semi-Formal",
    washCare: "Dry Clean Only",
    desc: "A rich Muslin Silk co-ord set featuring soft threadwork. The breathable fabric provides a natural shine, making it perfect for office wear and daytime gatherings."
  },
  {
    num: 5,
    name: "RC Dolby Angrakha Kurti",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2299,
    comparePrice: 2799,
    cat: "kurtis-kurtas",
    fabric: "Dolby Cotton",
    color: "Soft Rose Pink",
    length: "Calf Length",
    neckline: "Side-Tying Angrakha",
    sleeves: "3/4 Sleeves",
    occasion: "Festive / Social",
    washCare: "Gentle Hand Wash",
    desc: "A traditional overlapping Angrakha kurti adorned with detailed shadow work and side tie-ups. Crafted in comfortable Dolby textured cotton."
  },
  {
    num: 6,
    name: "RC Cotton set",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2799,
    comparePrice: 3299,
    cat: "coord-sets",
    fabric: "Pure Organic Cotton",
    color: "Lilac Lavender",
    length: "Knee Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Casual / Travel",
    washCare: "Machine Wash Cold",
    desc: "Everyday luxury co-ord set in breathable organic cotton, finished with Lucknow's heritage stitches. Perfect for travel and relaxing weekends."
  },
  {
    num: 7,
    name: "RC Muslin MK set",
    sizes: ["M", "L", "XL", "XXL"],
    unavailableSizes: ["XXL"],
    avail: true,
    price: 3199,
    comparePrice: 3799,
    cat: "coord-sets",
    fabric: "Muslin Silk",
    color: "Dusty Gold",
    length: "Below Knee",
    neckline: "Round V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive / Party",
    washCare: "Dry Clean Only",
    desc: "Premium Muslin MK set showcasing heavy floral embroidery details along the front panel and cuffs, offering a rich ethnic look."
  },
  {
    num: 8,
    name: "RC Dalby Straight Kurti",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 1899,
    comparePrice: 2299,
    cat: "kurtis-kurtas",
    fabric: "Dolby Cotton",
    color: "Sage Green",
    length: "Calf Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Workwear / Office",
    washCare: "Gentle Hand Wash",
    desc: "Classic straight-cut Dolby cotton Kurti featuring delicate paisley motifs. Tailored for a smart silhouette, suitable for office and daily wear."
  },
  {
    num: 9,
    name: "RC Rayon set",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2899,
    comparePrice: 3499,
    cat: "coord-sets",
    fabric: "Premium Rayon Liva",
    color: "Sunset Ochre",
    length: "Knee Length",
    neckline: "Boat Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Casual / Outing",
    washCare: "Gentle Hand Wash",
    desc: "A super-soft Rayon co-ord set with fluid drape and intricate white thread embroidery, blending comfort and craft seamlessly."
  },
  {
    num: 10,
    name: "RC Viscose Spaghetti set",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2499,
    comparePrice: 2999,
    cat: "coord-sets",
    fabric: "Viscose Georgette",
    color: "Powder Blue",
    length: "Short with Palazzo",
    neckline: "Spaghetti Straps",
    sleeves: "Sleeveless",
    occasion: "Festive / Social",
    washCare: "Dry Clean Only",
    desc: "A modern sleeveless spaghetti top paired with comfortable matching palazzos, featuring heavy Chikankari work on Viscose."
  },
  {
    num: 11,
    name: "RC Highlight Set",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2699,
    comparePrice: 3199,
    cat: "coord-sets",
    fabric: "Pure Cotton",
    color: "Sky Blue",
    length: "Knee Length",
    neckline: "V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Daily Elegance",
    washCare: "Gentle Hand Wash",
    desc: "Chikankari co-ord set highlighted with contrasting outline stitches and delicate buttons along the neckline."
  },
  {
    num: 12,
    name: "RC Highlight Set White",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 2699,
    comparePrice: 3199,
    cat: "coord-sets",
    fabric: "Pure Cotton",
    color: "Ivory White",
    length: "Knee Length",
    neckline: "V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Daily Elegance",
    washCare: "Gentle Hand Wash",
    desc: "An ivory version of our highlight set, featuring tone-on-tone white Chikankari embroidery for a pristine, minimalist look."
  },
  {
    num: 13,
    name: "RC MODAL Flower Kurta",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 1999,
    comparePrice: 2499,
    cat: "kurtis-kurtas",
    fabric: "Modal Silk",
    color: "Mustard Yellow",
    length: "Calf Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive / Social",
    washCare: "Gentle Hand Wash",
    desc: "Modal silk Kurti adorned with large floral boota motifs. It offers an incredibly soft hand feel and a luxurious drape."
  },
  {
    num: 14,
    name: "RC Phulkari Lehar Kurta",
    sizes: ["M", "L", "XL"],
    unavailableSizes: ["M"],
    avail: true,
    price: 2099,
    comparePrice: 2599,
    cat: "kurtis-kurtas",
    fabric: "Mulmul Cotton",
    color: "Emerald Green",
    length: "Calf Length",
    neckline: "Sweetheart Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive / Social",
    washCare: "Gentle Hand Wash",
    desc: "Crafted in mulmul cotton, this kurta combines traditional Chikankari stitches with vibrant Phulkari geometric highlights."
  },
  {
    num: 15,
    name: "RC Cotton Short Kurti",
    sizes: ["S", "M", "L"],
    avail: true,
    price: 1399,
    comparePrice: 1799,
    cat: "kurtis-kurtas",
    fabric: "Cotton Voile",
    color: "Peach Tint",
    length: "Short",
    neckline: "Round Neck with Slit",
    sleeves: "3/4 Sleeves",
    occasion: "College / Casual",
    washCare: "Machine Wash Cold",
    desc: "Breathable cotton voile short kurti, perfect for college wear and casual outings when styled with jeans."
  },
  {
    num: 16,
    name: "RC Rayon Short Kurti",
    sizes: ["S", "M", "L"],
    unavailableSizes: ["M"],
    avail: true,
    price: 1499,
    comparePrice: 1899,
    cat: "kurtis-kurtas",
    fabric: "Liva Rayon",
    color: "Pastel Lemon",
    length: "Short",
    neckline: "V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Dailywear",
    washCare: "Gentle Hand Wash",
    desc: "Soft Liva rayon short kurti featuring dense shadow-work floral designs on the neckline and sleeves."
  },
  {
    num: 17,
    name: "RC Rayon Kalini Kurti",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 1799,
    comparePrice: 2199,
    cat: "kurtis-kurtas",
    fabric: "Premium Rayon",
    color: "Crimson Red",
    length: "Calf Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Evening Outings",
    washCare: "Gentle Hand Wash",
    desc: "A rich red rayon Kurti designed with classic Lucknowi Chikankari bootis. Stitched to perfection for comfort and style."
  },
  {
    num: 18,
    name: "RC Rayon Kalini Kurti",
    sizes: ["M", "L", "XL"],
    avail: true,
    price: 1799,
    comparePrice: 2199,
    cat: "kurtis-kurtas",
    fabric: "Premium Rayon",
    color: "Turquoise Blue",
    length: "Calf Length",
    neckline: "Round Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Evening Outings",
    washCare: "Gentle Hand Wash",
    desc: "A stunning turquoise rayon Kalini Kurti, featuring detailed thread work that stands out beautifully."
  },
  {
    num: 19,
    name: "RC Viscose Rose MK Kurta Set",
    sizes: ["M", "L"],
    avail: true,
    price: 3299,
    comparePrice: 3899,
    cat: "coord-sets",
    fabric: "Viscose Rayon",
    color: "Dusty Rose Pink",
    length: "Below Knee",
    neckline: "Round V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive Wear",
    washCare: "Dry Clean Only",
    desc: "Premium Rose MK kurta and pants set, embroidered with fine rose-motifs Chikankari work on soft viscose fabric."
  },
  {
    num: 20,
    name: "RC Viscose Rose MK Kurta Set",
    sizes: ["M", "L"],
    avail: true,
    price: 3299,
    comparePrice: 3899,
    cat: "coord-sets",
    fabric: "Viscose Rayon",
    color: "Wine Burgundy",
    length: "Below Knee",
    neckline: "Round V-Neck",
    sleeves: "3/4 Sleeves",
    occasion: "Festive Wear",
    washCare: "Dry Clean Only",
    desc: "Elegant deep wine Viscose Rose MK kurta set, perfect for evening gatherings and family get-togethers."
  },
  {
    num: 21,
    name: "RC Cotton Flare Palazzo",
    sizes: ["Free Size"],
    avail: true,
    price: 1299,
    comparePrice: 1699,
    cat: "bottom-wear",
    fabric: "Pure Organic Cotton",
    color: "Off-White",
    length: "Ankle Length",
    neckline: "N/A",
    sleeves: "N/A",
    occasion: "Dailywear / Mix-Match",
    washCare: "Machine Wash Cold",
    desc: "Flared off-white cotton palazzos featuring heavy hand-embroidered border panels. Soft elasticated waistband for all-day comfort."
  },
  {
    num: 22,
    name: "RC Cotton Straight Palazzo",
    sizes: ["Free Size"],
    avail: true,
    price: 1199,
    comparePrice: 1499,
    cat: "bottom-wear",
    fabric: "Pure Organic Cotton",
    color: "Off-White",
    length: "Ankle Length",
    neckline: "N/A",
    sleeves: "N/A",
    occasion: "Dailywear / Mix-Match",
    washCare: "Machine Wash Cold",
    desc: "Tailored straight-cut palazzos featuring delicate Chikankari embroidery running along the side edges and hem."
  }
];

export async function GET() {
  try {
    const targetDir = path.join(process.cwd(), "public", "images", "reshamchikankari");

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ error: "Directory not found: " + targetDir });
    }

    const folders = fs.readdirSync(targetDir).filter((file) => {
      return fs.statSync(path.join(targetDir, file)).isDirectory();
    });

    const products = catalogInfo.map((info) => {
      const folderName = folders.find((f) => {
        if (info.num === 1) return f === "New folder";
        const match = f.match(/New folder (\d+)/);
        return match && parseInt(match[1], 10) === info.num;
      }) || `New folder ${info.num}`;
      const folderPath = path.join(targetDir, folderName);
      let files: string[] = [];
      
      if (fs.existsSync(folderPath)) {
        files = fs.readdirSync(folderPath).filter((file) => {
          return !fs.statSync(path.join(folderPath, file)).isDirectory();
        });
      }

      // Format slugs properly
      let slug = info.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if ([17, 18, 19, 20].includes(info.num)) {
        slug = `${slug}-${info.num}`;
      }

      const productImages = files.map((file, idx) => ({
        id: `img_${info.num}_${idx + 1}`,
        productId: `prod_rc_${info.num}`,
        url: `/images/reshamchikankari/${folderName}/${file}`,
        imageUrl: `/images/reshamchikankari/${folderName}/${file}`,
        publicId: `rc_${info.num}_${idx + 1}`,
        alt: `${info.name} Details View ${idx + 1}`,
        altText: `${info.name} Details View ${idx + 1}`,
        isPrimary: idx === 0,
        width: null,
        height: null,
        sortOrder: idx
      }));

      const productVariants = info.sizes.map((size) => {
        const isUnavailable = info.unavailableSizes?.includes(size);
        return {
          id: `var_rc_${info.num}_${size.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
          productId: `prod_rc_${info.num}`,
          sku: `RC-SKU-${info.num}-${size.toUpperCase().replace(/[^A-Z0-9]+/g, "")}`,
          name: size,
          pricePaise: info.price * 100,
          compareAtPricePaise: info.comparePrice * 100,
          stock: isUnavailable ? 0 : 12,
          inventoryQuantity: isUnavailable ? 0 : 12,
          isActive: true,
          isAvailable: true
        };
      });

      return {
        id: `prod_rc_${info.num}`,
        categoryId: info.cat === "coord-sets" ? "cat_coord" : info.cat === "kurtis-kurtas" ? "cat_kurtis" : "cat_bottom",
        name: info.name,
        slug,
        description: info.desc,
        sku: `RC-SKU-${info.num}`,
        pricePaise: info.price * 100,
        compareAtPricePaise: info.comparePrice * 100,
        isActive: true,
        featured: false,
        productNumber: info.num,
        fabric: info.fabric,
        color: info.color,
        length: info.length,
        neckline: info.neckline,
        sleeves: info.sleeves,
        occasion: info.occasion,
        washCare: info.washCare,
        images: productImages,
        variants: productVariants
      };
    });

    // Write the full lib/catalog/index.ts file statically
    let mockProductsCode = `export const MOCK_PRODUCTS: CatalogProductInput[] = ${JSON.stringify(products, null, 2)};`;

    const libContent = `import { db } from "@/db";
import { categories, products, type Category, type Product, type ProductImage, type ProductVariant } from "@/db/schema/catalog";
import { eq, and, like, gte, lte, asc, desc, inArray } from "drizzle-orm";

export interface CatalogProduct extends Product {
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
}

export type CatalogProductInput = Omit<
  CatalogProduct,
  "createdAt" | "updatedAt" | "fabric" | "color" | "length" | "neckline" | "sleeves" | "occasion" | "washCare" | "images" | "variants" | "featured"
> & {
  createdAt?: Date;
  updatedAt?: Date;
  fabric?: string | null;
  color?: string | null;
  length?: string | null;
  neckline?: string | null;
  sleeves?: string | null;
  occasion?: string | null;
  washCare?: string | null;
  featured?: boolean;
  images: (Omit<ProductImage, "createdAt" | "imageUrl" | "altText" | "isPrimary" | "width" | "height"> & {
    createdAt?: Date;
    imageUrl?: string | null;
    altText?: string | null;
    isPrimary?: boolean;
    width?: number | null;
    height?: number | null;
  })[];
  variants: (Omit<ProductVariant, "createdAt" | "updatedAt" | "compareAtPricePaise" | "inventoryQuantity" | "isAvailable"> & {
    createdAt?: Date;
    updatedAt?: Date;
    compareAtPricePaise?: number | null;
    inventoryQuantity?: number;
    isAvailable?: boolean;
  })[];
};

export function mapInputToCatalogProduct(p: CatalogProductInput): CatalogProduct {
  return {
    ...p,
    fabric: p.fabric ?? null,
    color: p.color ?? null,
    length: p.length ?? null,
    neckline: p.neckline ?? null,
    sleeves: p.sleeves ?? null,
    occasion: p.occasion ?? null,
    washCare: p.washCare ?? null,
    featured: p.featured ?? false,
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date(),
    images: p.images.map(img => ({
      ...img,
      imageUrl: img.imageUrl ?? img.url,
      altText: img.altText ?? img.alt ?? null,
      isPrimary: img.isPrimary ?? false,
      width: img.width ?? null,
      height: img.height ?? null,
      createdAt: img.createdAt || new Date()
    })),
    variants: p.variants.map(v => ({
      ...v,
      compareAtPricePaise: v.compareAtPricePaise ?? null,
      inventoryQuantity: v.inventoryQuantity ?? v.stock ?? 0,
      isAvailable: v.isAvailable ?? v.isActive ?? true,
      createdAt: v.createdAt || new Date(),
      updatedAt: v.updatedAt || new Date()
    }))
  } as CatalogProduct;
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat_kurtis",
    name: "Kurtis & Kurtas",
    slug: "kurtis-kurtas",
    description: "Traditional hand-embroidered Lucknowi Kurtis and long Kurtas featuring heritage Chikankari work.",
    image: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
    imageUrl: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat_coord",
    name: "Kurtas & Co-ord Sets",
    slug: "coord-sets",
    description: "Modern two-piece and three-piece co-ord sets styled with subtle Chikankari borders.",
    image: "/images/reshamchikankari/New folder/IMG_2685.JPG",
    imageUrl: "/images/reshamchikankari/New folder/IMG_2685.JPG",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat_bottom",
    name: "Bottom Wear",
    slug: "bottom-wear",
    description: "Premium Chikankari hand-embroidered straight pants, flared palazzos, and salwar bottoms.",
    image: "/images/reshamchikankari/New folder 21/IMG_3040.JPG",
    imageUrl: "/images/reshamchikankari/New folder 21/IMG_3040.JPG",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

${mockProductsCode}

// Helper to determine if DB connection should fallback
const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

export async function getCategories(): Promise<Category[]> {
  if (!hasDatabase()) return MOCK_CATEGORIES;

  try {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  } catch (err) {
    console.error("DB Query failed, falling back to mock categories:", err);
    return MOCK_CATEGORIES;
  }
}

export interface ProductFilters {
  categorySlug?: string;
  query?: string;
  priceMin?: number;
  priceMax?: number;
  productIds?: string[];
  sort?: string; // "price_asc" | "price_desc" | "newest"
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<{ products: CatalogProduct[]; total: number }> {
  const { categorySlug, query, priceMin, priceMax, sort, page = 1, limit = 12, productIds } = filters;

  if (!hasDatabase()) {
    let list = MOCK_PRODUCTS.map(mapInputToCatalogProduct);

    if (productIds && productIds.length > 0) {
      list = list.filter(p => productIds.includes(p.id));
    }

    if (categorySlug) {
      const cat = MOCK_CATEGORIES.find(c => c.slug === categorySlug);
      if (cat) {
        list = list.filter(p => p.categoryId === cat.id);
      }
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    if (priceMin !== undefined) {
      list = list.filter(p => p.pricePaise >= priceMin);
    }
    if (priceMax !== undefined) {
      list = list.filter(p => p.pricePaise <= priceMax);
    }

    if (sort === "price_asc") {
      list.sort((a, b) => a.pricePaise - b.pricePaise);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.pricePaise - a.pricePaise);
    } else {
      list.sort((a, b) => (b.createdAt || new Date(0)).getTime() - (a.createdAt || new Date(0)).getTime());
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginatedList = list.slice(startIndex, startIndex + limit);

    return { products: paginatedList, total };
  }

  try {
    const conditions = [eq(products.isActive, true)];

    if (productIds && productIds.length > 0) {
      conditions.push(inArray(products.id, productIds));
    }

    if (categorySlug) {
      const catResult = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
      if (catResult.length > 0) {
        conditions.push(eq(products.categoryId, catResult[0].id));
      }
    }

    if (query) {
      conditions.push(like(products.name, \`%\${query}%\`));
    }

    if (priceMin !== undefined) {
      conditions.push(gte(products.pricePaise, priceMin));
    }
    if (priceMax !== undefined) {
      conditions.push(lte(products.pricePaise, priceMax));
    }

    const orderBy = [];
    if (sort === "price_asc") {
      orderBy.push(asc(products.pricePaise));
    } else if (sort === "price_desc") {
      orderBy.push(desc(products.pricePaise));
    } else {
      orderBy.push(desc(products.createdAt));
    }

    const offset = (page - 1) * limit;

    const dbProducts = await db.query.products.findMany({
      where: and(...conditions),
      orderBy,
      limit,
      offset,
      with: {
        images: true,
        variants: true,
      },
    });

    const totalResult = await db.select().from(products).where(and(...conditions));
    const total = totalResult.length;

    return { products: dbProducts as CatalogProduct[], total };
  } catch (err) {
    console.error("DB Query failed, falling back to mock products:", err);
    return getProductsOffline(filters);
  }
}

function getProductsOffline(filters: ProductFilters): { products: CatalogProduct[]; total: number } {
  let list = MOCK_PRODUCTS.map(mapInputToCatalogProduct);
  const { categorySlug, query, priceMin, priceMax, sort, page = 1, limit = 12, productIds } = filters;

  if (productIds && productIds.length > 0) {
    list = list.filter(p => productIds.includes(p.id));
  }
  if (categorySlug) {
    const cat = MOCK_CATEGORIES.find(c => c.slug === categorySlug);
    if (cat) {
      list = list.filter(p => p.categoryId === cat.id);
    }
  }
  if (query) {
    list = list.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }
  if (priceMin !== undefined) {
    list = list.filter(p => p.pricePaise >= priceMin);
  }
  if (priceMax !== undefined) {
    list = list.filter(p => p.pricePaise <= priceMax);
  }
  if (sort === "price_asc") {
    list.sort((a, b) => a.pricePaise - b.pricePaise);
  } else if (sort === "price_desc") {
    list.sort((a, b) => b.pricePaise - a.pricePaise);
  }
  const total = list.length;
  const startIndex = (page - 1) * limit;
  return { products: list.slice(startIndex, startIndex + limit), total };
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!hasDatabase()) {
    const p = MOCK_PRODUCTS.find(p => p.slug === slug);
    return p ? mapInputToCatalogProduct(p) : null;
  }

  try {
    const productResult = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
      with: {
        images: true,
        variants: true,
      },
    });

    if (!productResult) return null;

    const catResult = await db.select().from(categories).where(eq(categories.id, productResult.categoryId)).limit(1);
    const category = catResult[0] ?? undefined;

    return {
      ...productResult,
      category,
    } as CatalogProduct;
  } catch (err) {
    console.error("DB Query failed, falling back to mock product:", err);
    const p = MOCK_PRODUCTS.find(p => p.slug === slug);
    return p ? mapInputToCatalogProduct(p) : null;
  }
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  const result = await getProducts({ query, limit: 20 });
  return result.products;
}
`;

    const libPath = path.join(process.cwd(), "lib", "catalog", "index.ts");
    fs.writeFileSync(libPath, libContent, "utf-8");

    // Write to db/seed.ts
    const seedPath = path.join(process.cwd(), "db", "seed.ts");
    const seedContent = `import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import * as auth from "./schema/auth";
import * as catalog from "./schema/catalog";
import * as cart from "./schema/cart";
import * as wishlist from "./schema/wishlist";
import * as coupon from "./schema/coupon";
import * as order from "./schema/order";
import * as payment from "./schema/payment";
import * as inventory from "./schema/inventory";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Please add it to your .env file.");
  process.exit(1);
}

const schema = {
  ...auth,
  ...catalog,
  ...cart,
  ...wishlist,
  ...coupon,
  ...order,
  ...payment,
  ...inventory,
};

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

const categoriesList = [
  {
    id: "cat_kurtis",
    name: "Kurtis & Kurtas",
    slug: "kurtis-kurtas",
    description: "Traditional hand-embroidered Lucknowi Kurtis and long Kurtas featuring heritage Chikankari work.",
    image: "/images/reshamchikankari/New folder 3/IMG_3001.JPG",
    isActive: true,
  },
  {
    id: "cat_coord",
    name: "Kurtas & Co-ord Sets",
    slug: "coord-sets",
    description: "Modern two-piece and three-piece co-ord sets styled with subtle Chikankari borders.",
    image: "/images/reshamchikankari/New folder/IMG_2685.JPG",
    isActive: true,
  },
  {
    id: "cat_bottom",
    name: "Bottom Wear",
    slug: "bottom-wear",
    description: "Premium Chikankari hand-embroidered straight pants, flared palazzos, and salwar bottoms.",
    image: "/images/reshamchikankari/New folder 21/IMG_3040.JPG",
    isActive: true,
  },
];

const productsList = ${JSON.stringify(products, null, 2)};

async function main() {
  console.log("🌱 Seeding 22 products to database...");

  try {
    // 1. Insert Categories
    console.log("Inserting categories...");
    for (const cat of categoriesList) {
      await db.insert(catalog.categories).values(cat).onConflictDoUpdate({
        target: catalog.categories.id,
        set: cat,
      });
    }

    // 2. Insert Products
    console.log("Inserting products...");
    for (const p of productsList) {
      const { images, variants, ...prodData } = p;
      
      await db.insert(catalog.products).values(prodData).onConflictDoUpdate({
        target: catalog.products.id,
        set: prodData,
      });

      // Clear existing images and variants to prevent duplicates
      await db.delete(catalog.productImages).where(eq(catalog.productImages.productId, p.id));
      await db.delete(catalog.productVariants).where(eq(catalog.productVariants.productId, p.id));

      // 3. Insert Product Images
      for (const img of images) {
        await db.insert(catalog.productImages).values(img);
      }

      // 4. Insert Product Variants
      for (const v of variants) {
        await db.insert(catalog.productVariants).values(v);
      }
    }

    console.log("🌱 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main();
`;
    let formattedSeedContent = seedContent;
    formattedSeedContent = formattedSeedContent.replace(/"createdAt":\s*"([^"]+)"/g, 'new Date("$1")');
    formattedSeedContent = formattedSeedContent.replace(/"updatedAt":\s*"([^"]+)"/g, 'new Date("$1")');
    fs.writeFileSync(seedPath, formattedSeedContent, "utf-8");

    return NextResponse.json({ success: true, count: products.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
