import React from "react";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-muted/40 p-4 border-b">
        {/* TODO: Implement Main App Header (F06.3) */}
        <p className="text-center font-semibold">
          [Main App Header Placeholder]
        </p>
      </header>
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
