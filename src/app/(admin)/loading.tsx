import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  // Esqueleto que imita a estrutura do AdminLayout (sidebar + header + content)
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Skeleton para AsideBar */}
      <div className="hidden border-r bg-muted/40 md:block p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2 mt-auto" />
      </div>
      <div className="flex flex-col">
        {/* Skeleton para Header */}
        <Skeleton className="h-14 w-full border-b" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Skeleton para Breadcrumbs */}
          <Skeleton className="h-6 w-1/2" />
          {/* Skeleton para Conteúdo Principal */}
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-2/3" />
        </div>
      </div>
    </div>
  );
}
