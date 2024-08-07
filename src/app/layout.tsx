import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { cn } from "@/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/header";
import AsideBar from "@/components/aside-bar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Mania Malhas",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <AsideBar />
            <div className="flex flex-col">
              <Header />
              <main className="p-2">{children}</main>
            </div>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
