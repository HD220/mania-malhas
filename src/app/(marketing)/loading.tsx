import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  // Pode ser um esqueleto que imita a estrutura do MarketingLayout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Skeleton para MarketingHeader */}
      <Skeleton className="h-16 w-full" />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        <Skeleton className="h-48 w-full" />
      </main>
      {/* Skeleton para MarketingFooter */}
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
