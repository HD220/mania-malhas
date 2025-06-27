import { SelectTransaction } from "../schemas/transactionSchema";

/**
 * Represents a transaction object augmented with the partner's name.
 * Useful for displaying transaction lists where partner identification is needed.
 */
export type TransactionWithPartner = SelectTransaction & { partnerName?: string | null };
