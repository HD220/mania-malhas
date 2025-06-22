import { dbType } from "@/db/postgres";
import { and, eq, desc, or, ilike, sql } from "drizzle-orm";
import {
  InsertPartner,
  SelectPartner,
  insertPartnerSchema,
  selectPartnerSchema,
} from "./schemas/partnerSchema";
import { partnerTable } from "../postgres/schema/partner";

export type DBConnection = dbType["db"];

export type PartnerRepository = (db: DBConnection) => {
  findAll: (status?: boolean) => Promise<SelectPartner[]>;
  findBySearch: (search: string, status: boolean) => Promise<SelectPartner[]>;
  findById: (id: string) => Promise<SelectPartner>;
  update: (id: string, data: InsertPartner) => Promise<void>;
  insert: (data: InsertPartner) => Promise<{ id: string }>;
};

/**
 * Factory function for creating a partner repository instance.
 * Contains methods for CRUD operations and querying partner data.
 * @param {DBConnection} db - The Drizzle database connection instance.
 * @returns {Object} An object containing partner repository methods.
 */
export const partnerRepository: PartnerRepository = (db) => {
  /**
   * Retrieves all partners, optionally filtered by status.
   * @param {boolean} [status=true] - The status of partners to retrieve (true for active, false for inactive).
   * @returns {Promise<SelectPartner[]>} A list of partners.
   */
  const findAll = async (status = true): Promise<SelectPartner[]> => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.active, status))
      .orderBy(({ createdAt }) => [desc(createdAt)]);

    return partnersDb;
  };

  /**
   * Finds partners by a search term (name, notes, or phone) and status.
   * Uses ILIKE for case-insensitive search and unaccent for ignoring accents.
   * @param {string} search - The search term.
   * @param {boolean} [status=true] - The status of partners to search for.
   * @returns {Promise<SelectPartner[]>} A list of matching partners.
   */
  const findBySearch = async (search: string, status = true): Promise<SelectPartner[]> => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(
        and(
          eq(partnerTable.active, status),
          or(
            sql`unaccent(${
              partnerTable.name
            }) ilike unaccent(${`%${search}%`})`,
            sql`unaccent(${
              partnerTable.notes
            }) ilike unaccent(${`%${search}%`})`,
            sql`unaccent(${
              partnerTable.phone
            }) ilike unaccent(${`%${search}%`})`
          )
        )
      )
      .orderBy(({ createdAt }) => [desc(createdAt)]);

    return partnersDb;
  };

  /**
   * Finds a single partner by their ID.
   * Returns null if the partner is not found or if parsing fails.
   * @param {string} id - The UUID of the partner.
   * @returns {Promise<SelectPartner | null>} The partner data or null.
   */
  const findById = async (id: string): Promise<SelectPartner | null> => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.id, id));

    if (partnersDb.length === 0) {
      return null; // Parceiro não encontrado
    }

    const [result] = partnersDb; // Agora sabemos que partnersDb tem pelo menos um item

    // Não é estritamente necessário verificar !result aqui se partnersDb.length > 0 já foi checado,
    // mas por segurança, caso a query retorne [null] ou [undefined] por algum motivo exótico.
    if (!result) {
      return null;
    }

    const parsed = selectPartnerSchema.safeParse(result);
    if (parsed.success) {
      return parsed.data;
    }

    // Se o parceiro foi encontrado mas a estrutura é inválida
    console.error(
      `Erro de parsing Zod para parceiro ID ${id}:`,
      parsed.error.flatten()
    );
    console.warn(`Parceiro com ID ${id} encontrado mas falhou na validação Zod. Retornando null.`);
    return null;
  };

  /**
   * Updates an existing partner's details.
   * @param {string} id - The UUID of the partner to update.
   * @param {InsertPartner} data - The partner data to update.
   * @returns {Promise<void>}
   */
  const update = async (id: string, { ...data }: InsertPartner): Promise<void> => {
    await db
      .update(partnerTable)
      .set({
        ...data,
      })
      .where(eq(partnerTable.id, id));
  };

  const insert = async ({ ...data }: InsertPartner) => {
    const [{ id }] = await db
      .insert(partnerTable)
      .values({
        ...data,
      })
      .returning({ id: partnerTable.id });

    return { id };
  };

  return {
    insert,
    update,
    findById,
    findAll,
    findBySearch,
  };
};
