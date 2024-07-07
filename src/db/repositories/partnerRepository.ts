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

export const partnerRepository: PartnerRepository = (db) => {
  const findAll = async (status = true) => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.active, status))
      .orderBy(({ createdAt }) => [desc(createdAt)]);

    return partnersDb;
  };

  const findBySearch = async (search: string, status = true) => {
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

  const findById = async (id: string) => {
    const partnersDb = await db
      .select()
      .from(partnerTable)
      .where(eq(partnerTable.id, id));

    const [result] = partnersDb;

    const parsed = selectPartnerSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    throw parsed.error;
  };

  const update = async (id: string, { ...data }: InsertPartner) => {
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
