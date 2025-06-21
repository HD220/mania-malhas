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
