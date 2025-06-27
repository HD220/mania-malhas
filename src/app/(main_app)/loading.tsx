import { Skeleton } from "@/components/ui/skeleton";

export default function MainAppLoading() {
  // Esqueleto que imita a estrutura do MainAppLayout
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skeleton para MainAppHeader */}
      <Skeleton className="h-16 w-full border-b" />
      <main className="flex-grow p-6 bg-background space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
      {/* Skeleton para MainAppFooter */}
      <Skeleton className="h-12 w-full border-t" />
    </div>
  );
}
