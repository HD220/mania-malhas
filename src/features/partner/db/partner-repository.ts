import { and, eq, desc, or, ilike, sql } from "drizzle-orm";

import { dbType } from "@/lib/db-config/postgres"; // Updated path

import {
  InsertPartner,
  SelectPartner,
  insertPartnerSchema, // This schema itself might need to be renamed or its internal 'table' reference checked
  selectPartnerSchema,
} from "../types/partner.schema"; // Updated path

import { partnerTable } from "./schema"; // Updated path

export type DBConnection = dbType["db"];

export type PartnerRepository = (db: DBConnection) => {
  findAll: (status?: boolean) => Promise<SelectPartner[]>;
  findBySearch: (search: string, status: boolean) => Promise<SelectPartner[]>;
  findById: (id: string) => Promise<SelectPartner | null>;
  update: (id: string, data: InsertPartner) => Promise<void>;
  insert: (data: InsertPartner) => Promise<{ id: string }>;
};

export const partnerRepository: PartnerRepository = (db) => {
  const findAll = async (status = true): Promise<SelectPartner[]> => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.active, status))
      .orderBy(({ createdAt }) => [desc(createdAt)]);

    return partnersDb.map(p => selectPartnerSchema.parse(p)); // Ensure parsing
  };

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

    return partnersDb.map(p => selectPartnerSchema.parse(p)); // Ensure parsing
  };

  const findById = async (id: string): Promise<SelectPartner | null> => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.id, id));

    if (partnersDb.length === 0) {
      return null;
    }
    const [result] = partnersDb;
    if (!result) return null;

    const parsed = selectPartnerSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    console.error(
      `Erro de parsing Zod para parceiro ID ${id}:`,
      parsed.error.flatten()
    );
    console.warn(`Parceiro com ID ${id} encontrado mas falhou na validação Zod. Retornando null.`);
    return null;
  };

  const update = async (id: string, { ...data }: InsertPartner): Promise<void> => {
    // Validate data before update
    const validatedData = insertPartnerSchema.parse(data);
    await db
      .update(partnerTable)
      .set({
        ...validatedData, // Use validated data
        updatedAt: new Date(), // Manually set updatedAt
      })
      .where(eq(partnerTable.id, id));
  };

  const insert = async ({ ...data }: InsertPartner) => {
    // Validate data before insert
    const validatedData = insertPartnerSchema.parse(data);
    const [{ id }] = await db
      .insert(partnerTable)
      .values({
        ...validatedData, // Use validated data
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
