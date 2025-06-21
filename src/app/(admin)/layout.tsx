import "@/styles/globals.css"; // Import global styles, though they might be better in the root layout
import { Header } from "@/components/header";
import AsideBar from "@/components/aside-bar";
import { cn } from "@/utils"; // Assuming cn is still needed here for specific admin layout styling

// Metadata from root can be defined here if specific to admin section, or managed hierarchically
// export const metadata: Metadata = {
// title: "Painel Administrativo - Mania Malhas",
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The main structural div for the admin panel
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AsideBar />
      <div className="flex flex-col">
        <Header />
        <main className="p-2">{children}</main>
      </div>
    </div>
  );
}
