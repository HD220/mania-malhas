"use client";

import { Search as SearchIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/utils";
import { ChangeEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SearchProps = {
  className?: string;
};

export function Search({ className }: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);
      if (event.target.value) {
        params.set("search", event.target.value);
      } else {
        params.delete("search");
      }

      replace(`${pathname}?${params.toString()}`);
    },
    400
  );
  return (
    <form className={cn("w-full", className)}>
      <div className="w-full relative">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisa..."
          className="w-full appearance-none bg-background pl-8 shadow-none"
          onChange={handleSearch}
          defaultValue={searchParams.get("search") || ""}
        />
      </div>
    </form>
  );
}
