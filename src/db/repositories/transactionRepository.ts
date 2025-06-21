import { dbType, db as defaultDb } from "@/db/postgres";
import { eq, desc } from "drizzle-orm";
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

// Interface para os filtros no repositório
export interface TransactionFiltersForRepo {
  type?: "E" | "S";
  status?: string;
  // Adicionar outros filtros conforme necessário (partnerId, date range, etc.)
}

export type TransactionRepositoryFactory = (dbInstance?: DBConnection) => {
  findAll: (filters?: TransactionFiltersForRepo) => Promise<TransactionWithPartner[]>; // Aceita filtros
  findById: (id: string) => Promise<SelectTransaction | null>;
  update: (id: string, data: Partial<InsertTransaction>) => Promise<void>;
  insert: (data: InsertTransaction) => Promise<{ id: string }>;
};

export const transactionRepository: TransactionRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const findAll = async (filters?: TransactionFiltersForRepo): Promise<TransactionWithPartner[]> => {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(transactionTable.type, filters.type));
    }
    if (filters?.status) {
      conditions.push(eq(transactionTable.status, filters.status));
    }
    // Adicionar mais condições de filtro aqui

    const query = db
      .select({
        // Select all fields from transactionTable
        ...transactionTable,
        // Select partner's name and alias it as partnerName
        partnerName: partnerTable.name,
      })
      .from(transactionTable)
      .leftJoin(partnerTable, eq(transactionTable.partnerId, partnerTable.id))
      // Aplicar condições de filtro se houver alguma
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactionTable.createdAt));

    const results = await query.execute(); // Executar a query

    // Parse results with the schema that includes partnerName
    return results.map(row => selectTransactionWithPartnerSchema.parse(row) as TransactionWithPartner);
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
  };
};
