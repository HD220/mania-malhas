import { DollarSign, ListChecks, Package, Users } from "lucide-react"; // Ícones
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/features/dashboard/actions"; // Ajuste o caminho se necessário

/**
 * AdminDashboardPage serves as the main landing page for the admin panel.
 * It displays key statistics (e.g., active products, active partners, pending transactions)
 * and provides quick navigation links to important sections of the application.
 * Data is fetched server-side via `getDashboardStats` action.
 */
export default async function AdminDashboardPage() {
  const statsResponse = await getDashboardStats();
  const stats = statsResponse.data; // Can be undefined if success is false or data is not present

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Ativos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeProductsCount ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de produtos ativos no catálogo.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Parceiros Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activePartnersCount ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de clientes/parceiros ativos.
            </p>
          </CardContent>
        </Card>
        {/* Card Placeholder para Transações Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingTransactionsCount ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingTransactionsTotalValue !== undefined
                ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.pendingTransactionsTotalValue)
                : "N/A"}
              {" em valor pendente."}
            </p>
          </CardContent>
        </Card>
        {/* Card Placeholder para Tarefas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Tarefas</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Em breve</div>
            <p className="text-xs text-muted-foreground">
              Lembretes e tarefas importantes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Navegue rapidamente para as seções mais importantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Link href="/product/new" passHref>
              <Button variant="outline" className="w-full justify-start text-left">Cadastrar Produto</Button>
            </Link>
            <Link href="/product/list" passHref>
              <Button variant="outline" className="w-full justify-start text-left">Listar Produtos</Button>
            </Link>
            <Link href="/partner/new" passHref>
              <Button variant="outline" className="w-full justify-start text-left">Cadastrar Parceiro</Button>
            </Link>
            <Link href="/partner/list" passHref>
              <Button variant="outline" className="w-full justify-start text-left">Listar Parceiros</Button>
            </Link>
            <Link href="/transactions/list" passHref>
               <Button variant="outline" className="w-full justify-start text-left">Listar Transações</Button>
            </Link>
            {/* Adicionar mais links conforme necessário */}
          </CardContent>
        </Card>

        {/* Você pode adicionar mais cards aqui, como "Atividade Recente" ou "Gráficos" */}
      </div>
      {!statsResponse.success && statsResponse.message && (
        <p className="text-red-500 text-center mt-4">
          Erro ao carregar estatísticas: {statsResponse.message}
        </p>
      )}
    </div>
  );
}
