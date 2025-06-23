import { getUserProfileAction } from "./actions"; // Server action
import { ProfileForm } from "@/components/forms/profile-form";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { SelectUser } from "@/db/repositories/schemas/userSchema";


export default async function AdminProfilePage() {
  // Fetch user data using the server action
  // This is a server component, so we can await server actions directly.
  const profileActionResponse = await getUserProfileAction();
  const currentUser: SelectUser | null = profileActionResponse.success ? (profileActionResponse.data ?? null) : null;

  // It's good practice to also handle the case where profileActionResponse.error exists
  if (!profileActionResponse.success || !currentUser) {
    // Log the error if needed, or display a more specific error message
    console.error("Failed to load user profile:", profileActionResponse.error);
    // You could render an error message or a fallback UI here
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* User Info Display Card (Optional, can be part of ProfileForm or separate) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Minha Conta</CardTitle>
            <CardDescription>
              Visão geral das suas informações de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser ? (
              <div className="flex flex-col items-center space-y-4 text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name ?? "Admin"} />
                  <AvatarFallback>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{currentUser.name ?? "Nome não disponível"}</h2>
                  <p className="text-muted-foreground">{currentUser.email ?? "Email não disponível"}</p>
                </div>
              </div>
            ) : (
              <p>Não foi possível carregar as informações do perfil.</p>
            )}
             {profileActionResponse.error && !currentUser && (
              <p className="text-sm text-destructive pt-2">
                Erro ao carregar perfil: {profileActionResponse.error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Profile Form Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pass currentUser, which can be null if initial fetch failed */}
            <ProfileForm currentUser={currentUser} />
          </CardContent>
        </Card>
      </div>

      {/* Change Password Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Modifique sua senha de acesso. Lembre-se de usar uma senha forte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
