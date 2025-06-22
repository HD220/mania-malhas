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

/**
 * Factory function for creating a product repository instance.
 * Contains methods for CRUD operations and querying product data, including associated images.
 * @param {DBConnection} db - The Drizzle database connection instance.
 * @returns {Object} An object containing product repository methods.
 */
export const productRepository: ProductRepository = (db) => {
  /**
   * Converts a flat list of product-image joins into a structured list of products,
   * where each product contains an array of its active images.
   * This is necessary because a left join can result in multiple rows per product if a product has multiple images.
   * @private
   * @param {JoinProductWithImage[]} productsDb - Flat array of product and image data from a database join.
   * @returns {SelectProductWithImages[]} An array of products with nested image arrays.
   */
  const convert = (productsDb: JoinProductWithImage[]): SelectProductWithImages[] => {
    const reduced = productsDb.reduce<SelectProductWithImages[]>(
      (accu, curr) => {
        // Skip if product part is null (should not happen with current queries but good for safety)
        if (!curr.product) return accu;

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

  /**
   * Retrieves all products, optionally filtered by status, including their active images.
   * @param {boolean} [status=true] - The status of products to retrieve (true for active, false for inactive).
   * @returns {Promise<SelectProductWithImages[]>} A list of products.
   */
  const findAll = async (status = true): Promise<SelectProductWithImages[]> => {
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

  /**
   * Finds products by a search term (name or description) and status, including their active images.
   * Uses ILIKE for case-insensitive search and unaccent for ignoring accents.
   * @param {string} search - The search term.
   * @param {boolean} [status=true] - The status of products to search for.
   * @returns {Promise<SelectProductWithImages[]>} A list of matching products.
   */
  const findBySearch = async (search: string, status = true): Promise<SelectProductWithImages[]> => {
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

  /**
   * Finds a single product by its ID, including its active images.
   * Returns null if the product is not found or if parsing fails.
   * @param {string} id - The UUID of the product.
   * @returns {Promise<SelectProductWithImages | null>} The product data or null.
   */
  const findById = async (id: string): Promise<SelectProductWithImages | null> => {
    // Query principal busca pelo ID do produto.
    // O LEFT JOIN agora filtra as imagens ativas na própria condição do JOIN.
    const productsDb = await db
      .select()
      .from(productTable)
      .leftJoin(
        productImagesTable,
        and(
          eq(productImagesTable.productId, productTable.id),
          eq(productImagesTable.active, true) // Imagens ativas apenas
        )
      )
      .where(eq(productTable.id, id)) // Filtra pelo ID do produto
      .orderBy(desc(productTable.createdAt), desc(productImagesTable.createdAt));

    if (productsDb.length === 0) {
      return null; // Produto não encontrado pelo ID
    }

    const [result] = convert(productsDb); // convert() deve lidar com múltiplas linhas de imagem para um produto

    if (!result) {
      // Isso pode acontecer se convert() retornar vazio por algum motivo inesperado
      // ou se productsDb continha apenas linhas onde product era null (não deveria acontecer com a query atual)
      return null;
    }

    const parsed = selectProductWithImagesSchema.safeParse(result);
    if (parsed.success) {
      return parsed.data;
    }

    // Se o produto foi encontrado mas a estrutura é inválida (raro se os tipos do DB estiverem corretos)
    console.error(
      `Erro de parsing Zod para produto ID ${id}:`,
      parsed.error.flatten()
    );
    // Lançar um erro genérico ou um erro de validação específico aqui.
    // Por enquanto, para não quebrar chamadores que não esperam um NotFoundError específico,
    // vamos manter o comportamento de lançar o erro do Zod, mas idealmente seria um erro customizado.
    // Ou, mais simples, retornar null também neste caso, indicando que o dado não está como esperado.
    // Decidindo por retornar null também se o parse falhar, para simplificar o tratamento de erro no chamador.
    // Considerar logar este erro de forma mais robusta.
    console.warn(`Produto com ID ${id} encontrado mas falhou na validação Zod. Retornando null.`);
    return null;
  };

  const findImageById = async (productId: string, imageId: string) => {
    const [image] = await db
      .select()
      .from(productImagesTable)
      .where(
        and(
          eq(productImagesTable.id, imageId),
          eq(productImagesTable.productId, productId)
          // eq(productImagesTable.active, true) // Opcional: considerar se deve retornar apenas imagens ativas aqui
        )
      );

    return image || null; // Retorna a imagem ou null se não encontrada
  };

  /**
   * Updates an existing product and its associated images.
   * Handles adding new images and updating existing ones based on whether an image ID is present.
   * @param {string} id - The UUID of the product to update.
   * @param {InsertProductWithImages} productData - The product data to update, including images.
   * @returns {Promise<void>}
   */
  const update = async (
    id: string,
    { images = [], ...data }: InsertProductWithImages
  ): Promise<void> => {
    // Process images: update existing, insert new ones.
    // Active status of images is handled by the data in `images` array.
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

  /**
   * Inserts a new product along with its associated images.
   * @param {InsertProductWithImages} productData - The product data to insert, including images.
   * @returns {Promise<{ id: string }>} An object containing the ID of the newly created product.
   */
  const insert = async ({ images, ...data }: InsertProductWithImages): Promise<{ id: string }> => {
    const [{ id }] = await db
      .insert(productTable)
      .values({
        ...data,
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
