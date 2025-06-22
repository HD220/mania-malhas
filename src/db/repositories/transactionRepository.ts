import { dbType, db as defaultDb } from "@/db/postgres";
import { eq, desc, asc } from "drizzle-orm"; // Importar asc
import {
  InsertTransaction,
  SelectTransaction,
  selectTransactionSchema,
  SelectTransactionWithPartner, // Import new type
  selectTransactionWithPartnerSchema // Import new schema
} from "./schemas/transactionSchema";
import { transactionTable } from "../postgres/schema/transaction";
import { partnerTable } from "../postgres/schema/partner"; // Import partnerTable for JOIN

export type DBConnection = dbType["db"];

import { and } from "drizzle-orm"; // Import 'and'
// Define a more specific return type for findAll when partner name is included
export type TransactionWithPartner = SelectTransaction & { partnerName?: string | null };

import { count } from "drizzle-orm"; // Import count
import { gte, lte } from "drizzle-orm"; // Import gte e lte para comparações de data
// Interface para os filtros no repositório
export interface TransactionFiltersForRepo {
  type?: "E" | "S";
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  partnerId?: string; // Adicionado partnerId
}

// Interface para parâmetros de paginação
export interface PaginationParams {
  offset?: number;
  limit?: number;
}

// Interface para parâmetros de ordenação
export type TransactionSortBy = keyof Pick<SelectTransaction, "date" | "value" | "status" | "description" | "type">;
export interface OrderByParams {
  column?: TransactionSortBy;
  direction?: "asc" | "desc";
}

export type TransactionRepositoryFactory = (dbInstance?: DBConnection) => {
  findAll: (filters?: TransactionFiltersForRepo, pagination?: PaginationParams, orderBy?: OrderByParams) => Promise<TransactionWithPartner[]>; // Aceita ordenação
  countAll: (filters?: TransactionFiltersForRepo) => Promise<number>;
  findById: (id: string) => Promise<SelectTransaction | null>;
  update: (id: string, data: Partial<InsertTransaction>) => Promise<void>;
  insert: (data: InsertTransaction) => Promise<{ id: string }>;
};

export const transactionRepository: TransactionRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  /**
   * Helper function to build an array of Drizzle filter conditions
   * based on the provided filter criteria.
   * @param {TransactionFiltersForRepo} [filters] - The filters to apply.
   * @returns {SQL<unknown>[]} An array of Drizzle conditions.
   */
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
      // Para incluir o dia inteiro, pode ser necessário ajustar para o final do dia (ex: 23:59:59)
      // ou garantir que a data no banco esteja armazenada sem hora ou com hora zerada.
      // Por simplicidade, usando lte diretamente.
      conditions.push(lte(transactionTable.date, filters.dateTo));
    }
    if (filters?.partnerId) {
      conditions.push(eq(transactionTable.partnerId, filters.partnerId));
    }
    return conditions;
  };

  /**
   * Finds all transactions, optionally filtered and paginated, including the partner's name.
   * @param {TransactionFiltersForRepo} [filters] - Optional filters to apply.
   * @param {PaginationParams} [pagination] - Optional pagination parameters (offset, limit).
   * @returns {Promise<TransactionWithPartner[]>} A list of transactions with partner names.
   */
  const findAll = async (filters?: TransactionFiltersForRepo, pagination?: PaginationParams): Promise<TransactionWithPartner[]> => {
    const conditions = buildFilterConditions(filters);

    let queryBuilder = db
      .select({
        // Select all fields from transactionTable
        ...transactionTable,
        // Select partner's name and alias it as partnerName
        partnerName: partnerTable.name,
      })
      .from(transactionTable)
      .leftJoin(partnerTable, eq(transactionTable.partnerId, partnerTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
      // .orderBy(desc(transactionTable.createdAt)); // Removido orderBy default daqui

    // Aplicar ordenação
    const sortableColumns: Record<TransactionSortBy, any> = { // Mapear para colunas Drizzle
      date: transactionTable.date,
      value: transactionTable.value,
      status: transactionTable.status,
      description: transactionTable.description,
      type: transactionTable.type,
    };

    const orderByColumn = orderBy?.column && sortableColumns[orderBy.column]
      ? sortableColumns[orderBy.column]
      : transactionTable.createdAt; // Default sort
    const orderByDirection = orderBy?.direction === "asc" ? asc : desc; // asc precisa ser importado de drizzle-orm

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

  /**
   * Counts all transactions, optionally applying filters.
   * @param {TransactionFiltersForRepo} [filters] - Optional filters to apply.
   * @returns {Promise<number>} The total count of matching transactions.
   */
  const countAll = async (filters?: TransactionFiltersForRepo): Promise<number> => {
    const conditions = buildFilterConditions(filters);

    const result = await db
      .select({ value: count() }) // count() or count(transactionTable.id)
      .from(transactionTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result[0]?.value ?? 0;
  };

  const findById = async (id: string): Promise<SelectTransaction | null> => {
    const resultList = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, id));

    if (resultList.length === 0) {
      return null;
    }
    const [result] = resultList;

    // Parse with Zod schema to ensure type conformity and apply coercions
    const parsed = selectTransactionSchema.safeParse(result);
    if (parsed.success) {
      return parsed.data;
    } else {
      // Se a transação foi encontrada mas a estrutura é inválida
      console.error(
        `Erro de parsing Zod para transação ID ${id}:`,
        parsed.error.flatten()
      );
      console.warn(`Transação com ID ${id} encontrada mas falhou na validação Zod. Retornando null.`);
      return null;
    }
  };

  const update = async (id: string, data: Partial<InsertTransaction>): Promise<void> => {
    // Note: `insertTransactionSchema` omits 'id'. If `data` might contain 'id', filter it out or use a specific update schema.
    // For Partial<InsertTransaction>, ensure 'id' is not in `data` or Drizzle handles it.
    const { id: dataId, ...updateData } = data as any; // Cast to any to remove id if present

    await db
      .update(transactionTable)
      .set(updateData)
      .where(eq(transactionTable.id, id));
  };

  const insert = async (data: InsertTransaction): Promise<{ id: string }> => {
    // `insertTransactionSchema` should have already validated the input.
    // It also omits 'id', 'createdAt', 'updatedAt'.
    const [{ id: newId }] = await db
      .insert(transactionTable)
      .values(data) // `data` is already shaped by `insertTransactionSchema`
      .returning({ id: transactionTable.id });

    return { id: newId };
  };

  return {
    insert,
    update,
    findById,
    findAll,
    countAll, // Adicionar countAll ao objeto retornado
  };
};
