import React from "react";

import { MainAppHeader } from "@/components/layout/main-app-header";
// import { MainAppFooter } from "@/components/layout/main-app-footer"; // Removed due to missing file

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
      {/* <MainAppFooter /> */} {/* Removed due to missing file */}
    </div>
  );
}
