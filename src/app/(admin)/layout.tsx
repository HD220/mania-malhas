// Este arquivo não importa mais "@/styles/globals.css" diretamente se estiver no RootLayout
// import "@/styles/globals.css";
import { Header } from "@/components/header";
import AsideBar from "@/components/aside-bar";
// cn pode não ser necessário aqui se não houver classes condicionais específicas para este layout
// import { cn } from "@/utils";

// Metadata pode ser definida aqui para o grupo (admin) se necessário,
// ou herdada/modificada a partir do RootLayout.
// export const metadata: Metadata = {
//   title: "Painel Administrativo - Mania Malhas",
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AsideBar />
      <div className="flex flex-col">
        <Header />
        <main className="p-2">{children}</main>
      </div>
    </div>
  );
}
