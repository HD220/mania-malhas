import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils"; // Corrected path

import "@/globals.css"; // Global styles last

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Mania Malhas", // Título base, pode ser sobrescrito
  description: "Sistema de gestão para Mania Malhas.", // Descrição padrão
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* suppressHydrationWarning é útil com next-themes */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* O conteúdo da página (incluindo outros layouts aninhados) será renderizado aqui */}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
