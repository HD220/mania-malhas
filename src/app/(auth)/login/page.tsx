import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() { // Renamed component for clarity, optional
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
