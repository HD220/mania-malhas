"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: Se estiver usando NextAuth.js, substitua isso por `import { signOut } from "next-auth/react"` (no cliente)
// ou pela chamada de API/backend do NextAuth.js para logout.
// A abordagem abaixo é para um sistema de cookies de sessão manual.

const SESSION_COOKIE_NAME = "session_token"; // Substitua pelo nome real do seu cookie de sessão

export async function logoutUser(): Promise<void> {
  try {
    // 1. Limpar o cookie de sessão
    const cookieStore = cookies();
    if (cookieStore.has(SESSION_COOKIE_NAME)) {
      cookieStore.delete(SESSION_COOKIE_NAME);
    }

    // Outras ações de limpeza de sessão no backend, se houver (ex: invalidar token no DB)
    // ...

  } catch (error) {
    console.error("Logout error:", error);
    // Mesmo que haja um erro ao limpar a sessão, geralmente ainda tentamos redirecionar.
    // Ou você pode querer tratar o erro de forma diferente.
  }

  // 2. Redirecionar para a página de login
  // O redirecionamento aqui na Server Action pode ser feito,
  // ou a Server Action pode retornar um status e o cliente faz o redirect.
  // Para logout, o redirect direto na SA é comum.
  redirect("/login"); // Ajuste o caminho se a página de login estiver em (auth)/login
}
