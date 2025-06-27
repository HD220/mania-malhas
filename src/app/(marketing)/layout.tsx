import React from 'react';

import MarketingFooter from '@/components/layout/marketing-footer';
import MarketingHeader from '@/components/layout/marketing-header';
// Importar a fonte Inter globalmente se ainda não estiver no layout raiz principal,
// ou se quisermos garantir que ela seja usada especificamente aqui.
// import { Inter } from 'next/font/google';

// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  // Metadados padrão para as páginas de marketing
  // Podem ser sobrescritos por páginas filhas
  title: 'Mania Malhas - Soluções para sua Confecção',
  description: 'Plataforma completa para gestão de malharias e confecções.',
  // Adicionar outras metatags relevantes para SEO aqui (Open Graph, etc.)
};

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    // Se a classe da fonte (ex: inter.className) for aplicada no RootLayout (app/layout.tsx),
    // não é estritamente necessário reaplicá-la aqui, a menos que se queira um override
    // ou garantir que ela esteja presente caso o RootLayout mude.
    // <div className={inter.className}>
    <div className="flex flex-col min-h-screen bg-gray-50 border-8 border-red-500"> {/* TEST BORDER */}
      <MarketingHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <MarketingFooter />
    </div>
    // </div>
  );
}
