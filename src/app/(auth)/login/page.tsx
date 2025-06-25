import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() { // Componente renomeado para clareza
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
