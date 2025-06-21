import { dbType, db as defaultDb } from "@/db/postgres"; // Import defaultDb for non-transactional operations
import { and, eq, desc, or, ilike, sql } from "drizzle-orm";
import {
  selectProductWithImagesSchema,
  type InsertProductImage,
  type SelectProductImage,
  type SelectProductWithImages,
  type InsertProduct, // Assuming InsertProduct is Omit<productTable, 'id'|'createdAt'|'updatedAt'> or similar
  selectProductImagesSchema,
} from "./schemas/productImageSchema"; // productImageSchema now likely exports InsertProduct from productSchema
import { productTable } from "../postgres/schema/product";
import { productImagesTable } from "../postgres/schema/productImage";

export type DBConnection = dbType["db"]; // This type can represent the main DB or a transaction instance

// Define a more specific type for product data without ID for insertion
type ProductDataForInsert = Omit<InsertProduct, "id" | "createdAt" | "updatedAt">;
// Define a type for product data for update (all fields optional, except what's needed by schema)
type ProductDataForUpdate = Partial<Omit<InsertProduct, "id" | "createdAt" | "updatedAt">>;


// Define a type for product image data for insertion
type ProductImageDataForInsert = Omit<InsertProductImage, "id" | "createdAt" | "updatedAt" | "productId"> & { productId: string };
type ProductImageDataForUpdate = Partial<Omit<InsertProductImage, "id" | "createdAt" | "updatedAt" | "productId">>;


export type ProductRepositoryFactory = (dbInstance?: DBConnection) => {
  findAll: (status?: boolean) => Promise<SelectProductWithImages[]>;
  findBySearch: (
    search: string,
    status: boolean
  ) => Promise<SelectProductWithImages[]>;
  findById: (id: string) => Promise<SelectProductWithImages | null>; // Allow null if not found
  findImageById: (
    productId: string,
    imageId: string
  ) => Promise<SelectProductImage | null>; // Allow null
  findActiveProductImagesByProductId: (productId: string) => Promise<SelectProductImage[]>;

  // Granular methods for use within transactions
  insertProduct: (data: ProductDataForInsert, tx?: DBConnection) => Promise<{ id: string }>;
  updateProduct: (productId: string, data: ProductDataForUpdate, tx?: DBConnection) => Promise<void>;
  insertProductImage: (data: ProductImageDataForInsert, tx?: DBConnection) => Promise<{ id: string }>;
  updateProductImage: (imageId: string, data: ProductImageDataForUpdate, tx?: DBConnection) => Promise<void>;
  deleteProductImage: (imageId: string, tx?: DBConnection) => Promise<void>;
};

type JoinProductWithImage = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  productImage: {
    id: string;
    name: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    url: string;
  } | null;
};

export const productRepository: ProductRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb; // Use injected db or default

  const convert = (productsDb: JoinProductWithImage[]): SelectProductWithImages[] => {
    if (!productsDb || productsDb.length === 0) return [];
    const productMap = new Map<string, SelectProductWithImages>();

    for (const row of productsDb) {
      if (!productMap.has(row.product.id)) {
        productMap.set(row.product.id, {
          ...row.product,
          images: [],
        });
      }
      if (row.productImage) {
        // Ensure image is active if there's a global filter for active images
        // This specific convert function might not need to double-check productImage.active
        // if the query already filters, but good for robustness if used elsewhere.
        productMap.get(row.product.id)!.images.push(row.productImage);
      }
    }
    return Array.from(productMap.values());
  };

  const findAll = async (status = true) => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        and(
            eq(productImagesTable.productId, productTable.id),
            eq(productImagesTable.active, true) // Only join active images
        )
      )
      .where(eq(productTable.active, status))
      .orderBy(desc(productTable.createdAt), desc(productImagesTable.createdAt));
    return convert(productsDb);
  };

  const findBySearch = async (search: string, status = true) => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        and(
            eq(productImagesTable.productId, productTable.id),
            eq(productImagesTable.active, true)
        )
      )
      .where(
        and(
          eq(productTable.active, status),
          or(
            sql`unaccent(${productTable.name}) ilike unaccent(${`%${search}%`})`,
            sql`unaccent(${productTable.description}) ilike unaccent(${`%${search}%`})`
          )
        )
      )
      .orderBy(desc(productTable.createdAt), desc(productImagesTable.createdAt));
    return convert(productsDb);
  };

  const findById = async (id: string): Promise<SelectProductWithImages | null> => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        and(
            eq(productImagesTable.productId, productTable.id),
            eq(productImagesTable.active, true)
        )
      )
      .where(eq(productTable.id, id))
      .orderBy(desc(productImagesTable.createdAt));

    if (productsDb.length === 0) return null;
    const [result] = convert(productsDb);

    // Schema validation is good, but findById should primarily focus on retrieval.
    // Validation can occur in use cases or when data is transformed for API response.
    // For now, let's assume 'convert' produces the correct shape.
    const parsed = selectProductWithImagesSchema.safeParse(result);
    if (parsed.success) return parsed.data;
    // Consider how to handle parsing errors: log, throw specific error, etc.
    // Returning null if parsing fails might hide issues.
    console.error("findById parsing error:", parsed.error);
    return null; // Or throw new Error("Failed to parse product data.");
  };

  const findImageById = async (productId: string, imageId: string): Promise<SelectProductImage | null> => {
    const [image] = await db
      .select()
      .from(productImagesTable)
      .where(
        and(
          eq(productImagesTable.id, imageId),
          eq(productImagesTable.productId, productId)
        )
      );
    return image || null;
  };

  const findActiveProductImagesByProductId = async (productId: string, currentDb: DBConnection = db): Promise<SelectProductImage[]> => {
    return await currentDb
      .select()
      .from(productImagesTable)
      .where(and(eq(productImagesTable.productId, productId), eq(productImagesTable.active, true)))
      .orderBy(desc(productImagesTable.createdAt));
  };

  // Granular methods
  const insertProduct = async (data: ProductDataForInsert, tx?: DBConnection) => {
    const currentDb = tx || db;
    const [newProduct] = await currentDb
      .insert(productTable)
      .values(data)
      .returning({ id: productTable.id });
    return newProduct;
  };

  const updateProduct = async (productId: string, data: ProductDataForUpdate, tx?: DBConnection) => {
    const currentDb = tx || db;
    await currentDb
      .update(productTable)
      .set(data)
      .where(eq(productTable.id, productId));
  };

  const insertProductImage = async (data: ProductImageDataForInsert, tx?: DBConnection) => {
    const currentDb = tx || db;
    const [newImage] = await currentDb
      .insert(productImagesTable)
      .values(data)
      .returning({id: productImagesTable.id});
    return newImage;
  };

  const updateProductImage = async (imageId: string, data: ProductImageDataForUpdate, tx?: DBConnection) => {
    const currentDb = tx || db;
    await currentDb
      .update(productImagesTable)
      .set(data)
      .where(eq(productImagesTable.id, imageId));
  };

  const deleteProductImage = async (imageId: string, tx?: DBConnection) => {
    const currentDb = tx || db;
    await currentDb
      .delete(productImagesTable)
      .where(eq(productImagesTable.id, imageId));
  };

  return {
    findAll,
    findBySearch,
    findById,
    findImageById,
    findActiveProductImagesByProductId,
    insertProduct,
    updateProduct,
    insertProductImage,
    updateProductImage,
    deleteProductImage,
  };
};
