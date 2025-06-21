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
 * Simple transformations are applied to labels (e.g., capitalizing, mapping 'list' to 'Lista').
 * Assumes the admin dashboard root is at "/".
 *
 * @param pathname The current URL pathname (e.g., from `usePathname()`).
 * @returns An array of `BreadcrumbItem` objects.
 */
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Base breadcrumb for the admin dashboard root.
  // The `href` should match the actual root path of the admin area.
  // If admin area is at `/admin`, this should be `/admin`.
  // Assuming (admin) group maps to `/` effectively for links within this layout.
  const adminRootPath = "/";
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Painel", href: adminRootPath, isCurrent: pathname === adminRootPath },
  ];

  let currentPath = ""; // Start with an empty path, will be built up relative to admin root
  // If adminRootPath is not "/", currentPath should start with adminRootPath.
  // However, links generated will be relative from where this component is mounted.
  // If the (admin) group handles the /admin prefix, then "/" is fine for links here.

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    // Tenta capitalizar e tornar o segmento mais legível
    // Pode ser necessário um mapeamento mais sofisticado para nomes amigáveis
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    if (label.toLowerCase() === 'list') label = 'Lista';
    if (label.toLowerCase() === 'new') label = 'Novo';
    if (label.toLowerCase() === 'edit') label = 'Editar';
    // TODO: Adicionar mais mapeamentos ou uma estratégia de tradução (ex: i18n)

    // Se for um UUID, tentar buscar um nome associado seria ideal, mas complexo aqui.
    // Por agora, se for UUID, pode-se mostrar "Detalhes" ou o próprio UUID.
    // Exemplo simples: se for 'edit' e o anterior for um recurso, pode ser "Editar [Recurso]"
    // Esta lógica pode se tornar bem complexa.

    breadcrumbs.push({
      label: label,
      href: currentPath,
      isCurrent: index === pathSegments.length - 1,
    });
  });

  return breadcrumbs;
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = generateBreadcrumbs(pathname);

  if (items.length <= 1 && items[0].href === pathname) { // Não mostrar se só tiver "Painel" e já estiver no painel
      if (pathname === '/') return null; // Ajuste para o path real do dashboard admin se não for '/'
  }
  // Se a página do dashboard admin for, por exemplo, /admin, e o pathname for /admin,
  // e o primeiro item for { label: "Painel", href: "/admin", isCurrent: true }, não mostrar.
  // A lógica do href da raiz do admin em generateBreadcrumbs deve ser o path real do dashboard.
  // Se o dashboard admin está em / (relativo ao (admin) group), então a lógica acima está ok.

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center space-x-1.5">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
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
