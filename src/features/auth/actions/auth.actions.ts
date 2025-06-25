"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: Se estiver usando NextAuth.js, substitua isso por `import { signOut } from "next-auth/react"` (no cliente)
// ou pela chamada de API/backend do NextAuth.js para logout.
// A abordagem abaixo é para um sistema de cookies de sessão manual.

/**
 * The name of the cookie used to store the session token.
 * @constant {string}
 * @remarks Replace with the actual session cookie name if different.
 */
const SESSION_COOKIE_NAME = "session_token"; // Substitua pelo nome real do seu cookie de sessão

/**
 * Server action to log out the current user.
 * This function clears the session cookie and redirects the user to the login page.
 * It's designed for a manual session cookie system. If using NextAuth.js or a similar library,
 * its own logout mechanisms should be used instead.
 *
 * @async
 * @function logoutUser
 * @returns {Promise<void>} A promise that resolves when the logout process is complete,
 *                          though it typically ends with a redirect, so the promise
 *                          might not resolve in the traditional sense on the client-side.
 * @throws This function will call `redirect()` which throws a NEXT_REDIRECT error.
 * @remarks
 * - This action deletes the session cookie specified by `SESSION_COOKIE_NAME`.
 * - It then redirects the user to the `/login` page.
 * - Error handling is basic; errors during cookie deletion are logged, but redirection still occurs.
 * - If additional backend session cleanup is needed (e.g., invalidating a token in a database),
 *   that logic should be added within the `try` block.
 */
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
