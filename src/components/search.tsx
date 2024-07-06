import { Search as SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/utils";

export type SearchProps = {
  className?: string;
};

export function Search({ className }: SearchProps) {
  return (
    <form className={cn("w-full", className)}>
      <div className="w-full relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full appearance-none bg-background pl-8 shadow-none"
        />
      </div>
    </form>
  );
}
