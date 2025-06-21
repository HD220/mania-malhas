import { dbType, db as defaultDb } from "@/db/postgres"; // Import defaultDb
import { eq, desc } from "drizzle-orm";
import { InsertTransaction, SelectTransaction, selectTransactionSchema } from "./schemas/transactionSchema";
import { transactionTable } from "../postgres/schema/transaction";

export type DBConnection = dbType["db"];

export type TransactionRepositoryFactory = (dbInstance?: DBConnection) => {
  findAll: () => Promise<SelectTransaction[]>;
  findById: (id: string) => Promise<SelectTransaction | null>; // Allow null if not found
  update: (id: string, data: Partial<InsertTransaction>) => Promise<void>; // Partial for update
  insert: (data: InsertTransaction) => Promise<{ id: string }>;
  // Add other methods like findByPartnerId, findByType, etc. as needed
};

export const transactionRepository: TransactionRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const findAll = async (): Promise<SelectTransaction[]> => {
    const data = await db
      .select()
      .from(transactionTable)
      .orderBy(desc(transactionTable.createdAt)); // Assuming direct use of table field

    // It's good practice to parse results, especially if there are coercions in select schema
    return data.map(row => selectTransactionSchema.parse(row));
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
      console.error("findById parsing error in transactionRepository:", parsed.error);
      // Decide on error handling: throw, or return null if parsing fails (might hide issues)
      throw new Error("Failed to parse transaction data.");
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
