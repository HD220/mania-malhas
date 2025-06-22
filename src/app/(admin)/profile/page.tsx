import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TODO: Integrar com o sistema de autenticação para buscar dados reais do usuário.
// Esta é uma simulação de como os dados do usuário podem ser obtidos.
// Em um cenário real, você usaria algo como:
// import { auth } from "@/auth"; // Exemplo se usando NextAuth.js
// const session = await auth();
// const user = session?.user;

interface UserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  // Adicione outros campos conforme necessário
}

/**
 * Simulates fetching the current user's profile data.
 * In a real application, this would integrate with an authentication system (e.g., NextAuth.js)
 * to retrieve actual user information.
 *
 * @returns {Promise<UserProfile | null>} A promise that resolves to the user's profile data or null.
 */
async function getUserProfile(): Promise<UserProfile | null> {
  // Simulação:
  // Em um app real, aqui você faria a chamada para obter os dados do usuário logado.
  // Ex: const session = await auth(); return session?.user;
  // Por agora, retornamos dados mockados ou nulos.
  // Para simular, vamos assumir que podemos obter o email.
  // Se estivéssemos usando NextAuth, poderíamos tentar:
  // try {
  //   const { auth } = await import("@/auth"); // Tentativa de importação dinâmica
  //   const session = await auth();
  //   if (session?.user) return session.user;
  // } catch (e) {
  //   console.warn("Não foi possível carregar informações de sessão (auth não configurado/disponível):", e);
  // }
  return {
    name: "Admin Usuário",
    email: "admin@example.com",
    image: null, // ou uma URL para uma imagem padrão
  };
}

/**
 * `AdminProfilePage` displays the profile information of the currently logged-in administrator.
 * Currently, it uses simulated user data. In a real application, it would fetch this
 * data from an authentication provider.
 *
 * TODO: Integrate with a real authentication system to display actual user data
 * and potentially allow profile/password updates.
 */
export default async function AdminProfilePage() {
  const user = await getUserProfile();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Administrador</CardTitle>
          <CardDescription>
            Informações da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Admin"} />
                <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : "A"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.name ?? "Nome não disponível"}</h2>
                <p className="text-muted-foreground">{user.email ?? "Email não disponível"}</p>
              </div>
            </div>
          ) : (
            <p>Não foi possível carregar as informações do perfil.</p>
          )}

          <div className="space-y-2 pt-4">
            <h3 className="text-lg font-medium">Detalhes da Conta</h3>
            <div className="text-sm text-muted-foreground">
              {/* Mais detalhes podem ser adicionados aqui */}
              <p><strong>ID do Usuário:</strong> (Em breve)</p>
              <p><strong>Função:</strong> Administrador</p>
              <p><strong>Último Login:</strong> (Em breve)</p>
            </div>
          </div>

          {/*
          TODO: Adicionar funcionalidade de alteração de senha ou outros dados do perfil
          <div className="pt-6">
            <Button variant="outline">Alterar Senha</Button>
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
