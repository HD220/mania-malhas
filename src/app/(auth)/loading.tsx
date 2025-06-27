import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  // Um esqueleto de página inteira simples, já que o layout de auth é minimalista
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-10 w-1/2 mx-auto" /> {/* Title placeholder */}
        <Skeleton className="h-12 w-full" /> {/* Input placeholder */}
        <Skeleton className="h-12 w-full" /> {/* Input placeholder */}
        <Skeleton className="h-12 w-full" /> {/* Button placeholder */}
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    </div>
  );
}
