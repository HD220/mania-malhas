import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository } from "@/db/repositories/transactionRepository"; // Renomeado para evitar conflito de nome
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";

// Tipos para filtros (podem ser expandidos)
export interface GetTransactionsFilters {
  status?: string;
  type?: "E" | "S";
  partnerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  // TODO: Adicionar paginação e ordenação
}

export default async function getTransactionsUseCase(
  filters?: GetTransactionsFilters // Aceita filtros opcionais
): Promise<SelectTransaction[]> {
  const transactionRepo = createTransactionRepository(db);

  // Por enquanto, o findAll do repositório não aceita filtros.
  // Esta é uma simplificação. Idealmente, os filtros seriam passados para o repositório
  // para que a filtragem ocorra no nível do banco de dados.
  let transactions = await transactionRepo.findAll();

  // Aplicar filtros no lado da aplicação (temporário, até o repositório suportar)
  if (filters) {
    if (filters.status) {
      transactions = transactions.filter(t => t.status === filters.status);
    }
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters.partnerId) {
      transactions = transactions.filter(t => t.partnerId === filters.partnerId);
    }
    if (filters.dateFrom) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.dateTo!));
    }
  }

  return transactions;
}
