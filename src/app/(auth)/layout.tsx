import React from "react";

// Este é o layout para as rotas de autenticação, como /login, /register, etc.
// Geralmente é bem simples, apenas renderizando os children,
// pois essas páginas não costumam ter o mesmo header/sidebar do app principal.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
