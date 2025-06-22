"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react"; // Exemplo de ícone

interface BreadcrumbItem {
  label: string;
  href: string;
  label: string;
  href: string;
  isCurrent: boolean;
}

/**
 * Generates an array of breadcrumb items based on the current pathname.
 *
 * Each segment of the path is converted into a breadcrumb item.
 * Transformations are applied to labels for readability.
 * Dynamic segments (like IDs) are handled generically.
 * Assumes the admin dashboard root is at "/".
 *
 * @param pathname The current URL pathname (e.g., from `usePathname()`).
 * @returns An array of `BreadcrumbItem` objects.
 */
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const adminRootPath = "/";
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Painel", href: adminRootPath, isCurrent: pathname === adminRootPath || pathname === "/admin" }, // Handle /admin as root too
  ];

  // Simple regex to check for UUIDs or numeric IDs. This can be improved.
  const idRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$|^[0-9]+$/;

  const segmentToLabelMap: Record<string, string> = {
    transactions: "Transações",
    product: "Produtos",
    partner: "Parceiros",
    list: "Listagem",
    new: "Novo Cadastro",
    edit: "Editar",
    profile: "Perfil",
    // Add more mappings as needed
  };

  let currentPath = ""; // Path relative to the admin root.

  pathSegments.forEach((segment, index) => {
    // Skip "admin" segment if present, as it's part of the layout group, not a breadcrumb item itself.
    if (segment.toLowerCase() === "admin" && index === 0) {
        // If the path starts with /admin, ensure currentPath starts correctly for subsequent segments.
        // However, since adminRootPath is "/", hrefs will be relative from there.
        return;
    }

    currentPath += `/${segment}`;
    let label = segmentToLabelMap[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // Generic handling for ID-like segments
    if (idRegex.test(segment)) {
      // If the previous segment was a resource name (e.g., "Produtos"),
      // and current is "edit", make it "Editar [Recurso]"
      // For a simple approach, if it's an ID and the next is "edit", we can adjust.
      // Or, if it's an ID and it's the last segment, it might be "Detalhes".
      // This simple version will just call it "Item" or adjust based on "edit".
      if (index < pathSegments.length - 1 && pathSegments[index + 1]?.toLowerCase() === 'edit') {
        // This ID is part of an edit path, the "edit" segment will handle its label.
        // We can make this segment's label more generic or specific if we know the resource.
        // For simplicity, we might rely on the "edit" segment's label.
        // Or, we could try to get the previous segment's label:
        const prevSegmentLabel = breadcrumbs[breadcrumbs.length-1]?.label;
        if (prevSegmentLabel && prevSegmentLabel !== "Painel") {
            label = `Detalhes de ${prevSegmentLabel.slice(0,-1)}`; // e.g. "Detalhes de Produto"
        } else {
            label = "Detalhes do Item";
        }
      } else if (pathSegments[index -1]?.toLowerCase() === 'edit' && breadcrumbs.length > 1) {
        // This case should ideally be handled by the "edit" segment's label already.
        // If previous was "Edit", this ID segment might not need its own distinct label.
        // Or it means /resource/edit/[id] - this case is less common for breadcrumbs.
        // Let's assume /resource/[id]/edit
      }
      else {
        label = "Detalhes"; // Default for an ID segment not followed by "edit"
      }
    }

    // Specific override for "edit" if previous was a resource ID
    if (segment.toLowerCase() === 'edit' && index > 0 && idRegex.test(pathSegments[index-1])) {
        const resourceLabel = breadcrumbs[breadcrumbs.length-1]?.label;
        if (resourceLabel && resourceLabel.startsWith("Detalhes de ")) {
            label = `Editar ${resourceLabel.substring("Detalhes de ".length)}`;
        } else if (resourceLabel && resourceLabel === "Detalhes") {
            // Try to get the segment before the ID
            if (index > 1) {
                const trueResourceSegment = pathSegments[index-2];
                const mappedResource = segmentToLabelMap[trueResourceSegment.toLowerCase()] || trueResourceSegment.charAt(0).toUpperCase() + trueResourceSegment.slice(1);
                label = `Editar ${mappedResource.slice(0,-1)}`; // Attempt to singularize
            } else {
                label = "Editar Item";
            }
        }
        else {
           label = "Editar Item";
        }
    }


    breadcrumbs.push({
      label: label,
      href: currentPath, // This href will be relative to the (admin) group root
      isCurrent: index === pathSegments.length - 1 || (index === pathSegments.length - 2 && segment.toLowerCase() === "admin"),
    });
  });

  // Filter out the "Admin" segment if it was accidentally added and not the root.
  // This can happen if path is like /admin/transactions and "admin" is processed.
  // The initial "Painel" handles the root.
  const finalBreadcrumbs = breadcrumbs.filter(bc => !(bc.label.toLowerCase() === 'admin' && bc.href === '/admin' && breadcrumbs.length > 1 && breadcrumbs[0].label === "Painel"));


  return finalBreadcrumbs;
};

export function Breadcrumbs() {
  const pathname = usePathname();
  // For paths like /admin/transactions, usePathname() gives /admin/transactions.
  // We want to process segments *after* the implicit /admin if the root is "Painel" @ "/"
  // If the (admin) group effectively means that inside `app/(admin)/layout.tsx`, `usePathname`
  // might already give paths relative to the group (e.g. /transactions for /admin/transactions).
  // Let's assume usePathname() gives the full path from site root.

  // Remove /admin prefix for processing if present, because "Painel" is already at "/" (relative to admin layout)
  const processedPathname = pathname.startsWith("/admin") ? pathname.substring("/admin".length) : pathname;
  const items = generateBreadcrumbs(processedPathname);

  // Hide breadcrumbs if it's just "Painel" and we are on the dashboard page.
  if (items.length === 1 && items[0].label === "Painel" && items[0].isCurrent) {
    return null;
  }

  if (items.length === 0) return null; // Should not happen if "Painel" is always there.

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center space-x-1.5">
        {items.map((item, index) => (
          <li key={item.href + index} className="flex items-center"> {/* Added index to key for safety */}
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 mx-1" />
            )}
            {item.isCurrent ? (
              <span className="font-semibold text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:underline hover:text-foreground">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
