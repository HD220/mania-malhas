import React from "react";
import { MainAppHeader } from "@/components/layout/main-app-header";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainAppHeader />
      <main className="flex-grow p-6 bg-background">
        {children}
      </main>
      <footer className="bg-muted/40 p-4 border-t text-center">
        {/* TODO: Implement Main App Footer (F06.4) */}
        <p className="text-sm text-muted-foreground">
          [Main App Footer Placeholder] &copy; {new Date().getFullYear()} Mania Malhas
        </p>
      </footer>
    </div>
  );
}
