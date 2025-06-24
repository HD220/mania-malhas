import { dbType, db as defaultDb } from "@/db/postgres";
import { eq, desc, asc, sql, and, count, gte, lte } from "drizzle-orm";
import {
  InsertTransaction,
  SelectTransaction,
  selectTransactionSchema,
  SelectTransactionWithPartner,
  selectTransactionWithPartnerSchema
} from "../schemas/transactionSchema"; // Adjusted import path
import { transactionTable } from "@/db/postgres/schema/transaction"; // Adjusted import path
import { partnerTable } from "@/db/postgres/schema/partner"; // Adjusted import path

export type DBConnection = dbType["db"];

export type TransactionWithPartner = SelectTransaction & { partnerName?: string | null };

export interface TransactionFiltersForRepo {
  type?: "E" | "S";
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  partnerId?: string;
  description?: string;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export type TransactionSortBy = keyof Pick<SelectTransaction, "date" | "value" | "status" | "description" | "type">;
export interface OrderByParams {
  column?: TransactionSortBy;
  direction?: "asc" | "desc";
}

export type TransactionRepositoryFactory = (dbInstance?: DBConnection) => {
  findAll: (filters?: TransactionFiltersForRepo, pagination?: PaginationParams, orderBy?: OrderByParams) => Promise<TransactionWithPartner[]>;
  countAll: (filters?: TransactionFiltersForRepo) => Promise<number>;
  findById: (id: string) => Promise<SelectTransaction | null>;
  update: (id: string, data: Partial<InsertTransaction>) => Promise<void>;
  insert: (data: InsertTransaction) => Promise<{ id: string }>;
  deleteById: (id: string) => Promise<void>;
};

export const transactionRepository: TransactionRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const buildFilterConditions = (filters?: TransactionFiltersForRepo) => {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(transactionTable.type, filters.type));
    }
    if (filters?.status) {
      conditions.push(eq(transactionTable.status, filters.status));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(transactionTable.date, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(transactionTable.date, filters.dateTo));
    }
    if (filters?.partnerId) {
      conditions.push(eq(transactionTable.partnerId, filters.partnerId));
    }
    if (filters?.description && filters.description.trim() !== "") {
      conditions.push(sql`unaccent(${transactionTable.description}) ilike unaccent(${`%${filters.description.trim()}%`})`);
    }
    return conditions;
  };

  const findAll = async (filters?: TransactionFiltersForRepo, pagination?: PaginationParams, orderBy?: OrderByParams): Promise<TransactionWithPartner[]> => {
    const conditions = buildFilterConditions(filters);

    let queryBuilder = db
      .select({
        ...transactionTable,
        partnerName: partnerTable.name,
      })
      .from(transactionTable)
      .leftJoin(partnerTable, eq(transactionTable.partnerId, partnerTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const sortableColumns: Record<TransactionSortBy, any> = {
      date: transactionTable.date,
      value: transactionTable.value,
      status: transactionTable.status,
      description: transactionTable.description,
      type: transactionTable.type,
    };

    const orderByColumn = orderBy?.column && sortableColumns[orderBy.column]
      ? sortableColumns[orderBy.column]
      : transactionTable.createdAt;
    const orderByDirection = orderBy?.direction === "asc" ? asc : desc;

    queryBuilder = queryBuilder.orderBy(orderByDirection(orderByColumn));

    if (pagination?.limit) {
      queryBuilder = queryBuilder.limit(pagination.limit);
    }
    if (pagination?.offset) {
      queryBuilder = queryBuilder.offset(pagination.offset);
    }

    const results = await queryBuilder.execute();
    return results.map(row => selectTransactionWithPartnerSchema.parse(row) as TransactionWithPartner);
  };

  const countAll = async (filters?: TransactionFiltersForRepo): Promise<number> => {
    const conditions = buildFilterConditions(filters);
    const result = await db
      .select({ value: count() })
      .from(transactionTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    return result[0]?.value ?? 0;
  };

  const findById = async (id: string): Promise<SelectTransaction | null> => {
    const resultList = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, id));

    if (resultList.length === 0) return null;
    const [result] = resultList;
    if (!result) return null;

    const parsed = selectTransactionSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    console.error(`Erro de parsing Zod para transação ID ${id}:`, parsed.error.flatten());
    console.warn(`Transação com ID ${id} encontrada mas falhou na validação Zod. Retornando null.`);
    return null;
  };

  const update = async (id: string, data: Partial<InsertTransaction>): Promise<void> => {
    const { id: dataId, ...updateData } = data as any;
    await db
      .update(transactionTable)
      .set(updateData)
      .where(eq(transactionTable.id, id));
  };

  const insert = async (data: InsertTransaction): Promise<{ id: string }> => {
    const [{ id: newId }] = await db
      .insert(transactionTable)
      .values(data)
      .returning({ id: transactionTable.id });
    return { id: newId };
  };

  const deleteById = async (id: string): Promise<void> => {
    await db.delete(transactionTable).where(eq(transactionTable.id, id));
  };

  return {
    insert,
    update,
    findById,
    findAll,
    countAll,
    deleteById,
  };
};
