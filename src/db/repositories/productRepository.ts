import { dbType } from "@/db/postgres";
import { and, eq, desc, or, ilike, sql } from "drizzle-orm";
import {
  selectProductWithImagesSchema,
  type InsertProductWithImages,
  type SelectProductImage,
  type SelectProductWithImages,
} from "./schemas/productImageSchema";
import { productTable } from "../postgres/schema/product";
import { productImagesTable } from "../postgres/schema/productImage";

export type DBConnection = dbType["db"];

export type ProductRepository = (db: DBConnection) => {
  findAll: (status?: boolean) => Promise<SelectProductWithImages[]>;
  findBySearch: (
    search: string,
    status: boolean
  ) => Promise<SelectProductWithImages[]>;
  findById: (id: string) => Promise<SelectProductWithImages>;
  findImageById: (
    productId: string,
    imageId: string
  ) => Promise<SelectProductImage>;
  update: (id: string, data: InsertProductWithImages) => Promise<void>;
  insert: (data: InsertProductWithImages) => Promise<{ id: string }>;
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

export const productRepository: ProductRepository = (db) => {
  const convert = (productsDb: JoinProductWithImage[]) => {
    const reduced = productsDb.reduce<SelectProductWithImages[]>(
      (accu, curr, idx, arr) => {
        const idxExists = accu.findIndex(({ id }) => id === curr.product.id);

        if (idxExists !== -1) {
          if (curr.productImage) accu[idxExists].images.push(curr.productImage);
          return [...accu];
        }

        return [
          ...accu,
          {
            ...curr.product,
            images: curr.productImage ? [curr.productImage] : [],
          },
        ];
      },
      [] as SelectProductWithImages[]
    );

    return reduced;
  };

  const findAll = async (status = true) => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        eq(productImagesTable.productId, productTable.id)
      )
      .where(
        and(
          eq(productTable.active, status),
          eq(productImagesTable.active, true)
        )
      )
      .orderBy(({ product, productImage }) => [
        desc(product.createdAt),
        desc(productImage.createdAt),
      ]);

    return convert(productsDb);
  };

  const findBySearch = async (search: string, status = true) => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        eq(productImagesTable.productId, productTable.id)
      )
      .where(
        and(
          eq(productTable.active, status),
          eq(productImagesTable.active, true),
          or(
            sql`unaccent(${
              productTable.name
            }) ilike unaccent(${`%${search}%`})`,
            sql`unaccent(${
              productTable.description
            }) ilike unaccent(${`%${search}%`})`
          )
        )
      )
      .orderBy(({ product, productImage }) => [
        desc(product.createdAt),
        desc(productImage.createdAt),
      ]);

    return convert(productsDb);
  };

  const findById = async (id: string) => {
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        eq(productImagesTable.productId, productTable.id)
      )
      .where(and(eq(productImagesTable.active, true), eq(productTable.id, id)))
      .orderBy(({ product, productImage }) => [
        desc(product.createdAt),
        desc(productImage.createdAt),
      ]);

    const [result] = convert(productsDb);

    const parsed = selectProductWithImagesSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    throw parsed.error;
  };

  const findImageById = async (productId: string, imageId: string) => {
    const [image] = await db
      .select()
      .from(productImagesTable)
      .where(
        and(
          eq(productImagesTable.id, imageId),
          eq(productImagesTable.productId, productId)
        )
      );

    return image;
  };

  const update = async (
    id: string,
    { images = [], ...data }: InsertProductWithImages
  ) => {
    await Promise.all(
      images?.map((image) => {
        if (image.id === undefined) {
          return db.insert(productImagesTable).values({
            productId: id,
            name: image.name!,
            url: image.url!,
            active: true,
          });
        }
        return db
          .update(productImagesTable)
          .set({ ...image })
          .where(eq(productImagesTable.id, image.id));
      })
    );

    await db
      .update(productTable)
      .set({
        ...data,
      })
      .where(eq(productTable.id, id));
  };

  const insert = async ({ images, ...data }: InsertProductWithImages) => {
    const [{ id }] = await db
      .insert(productTable)
      .values({
        name: data.name,
        description: data.description,
        price: data.price,
      })
      .returning({ id: productTable.id });
    await Promise.all(
      images?.map((image) =>
        db.insert(productImagesTable).values({
          ...image,
          productId: id,
        })
      ) || []
    );

    return { id };
  };

  return {
    insert,
    update,
    findById,
    findImageById,
    findAll,
    findBySearch,
  };
};
