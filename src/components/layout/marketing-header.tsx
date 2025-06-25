import Link from 'next/link';
import Image from 'next/image';

// Supondo que o logo esteja em /public/logo.png ou similar,
// ou src/assets/logo.jpg como identificado anteriormente.
// Por ora, vou usar um placeholder de texto se o logo não for facilmente importável aqui.
// Idealmente, o caminho do logo viria de uma constante ou configuração.
// const logoPath = '/assets/logo.jpg'; // Se estiver em public/assets/
// Para usar de src/assets, precisaríamos de um import direto se o loader estiver configurado
// ou movê-lo para public. Vou usar um placeholder textual por simplicidade de setup imediato.

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link href={href} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
      {children}
    </Link>
  );
};

const MarketingHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/(marketing)" className="text-2xl font-bold text-blue-600">
              {/* <Image src={logoPath} alt="Mania Malhas Logo" width={150} height={40} /> */}
              Mania Malhas
            </Link>
          </div>

          {/* Navegação Principal - Visível em telas maiores */}
          <nav className="hidden md:flex space-x-4">
            <NavLink href="/(marketing)">Home</NavLink>
            <NavLink href="/(marketing)/sobre">Sobre Nós</NavLink>
            <NavLink href="/(marketing)/contato">Contato</NavLink>
            <NavLink href="/(marketing)/faq">FAQ</NavLink>
          </nav>

          {/* Botões de Ação - Visível em telas maiores */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/login" // Ajustar para o path correto do grupo (auth) se necessário, ex: /auth/login
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Acessar App
            </Link>
            <Link
              href="/signup" // Ajustar para o path correto, ex: /auth/signup
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cadastre-se
            </Link>
          </div>

          {/* Botão de Menu Mobile - Adicionar funcionalidade depois se necessário */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Estado para menu mobile
            >
              <span className="sr-only">Abrir menu principal</span>
              {/* Ícone de Hamburguer */}
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown - Adicionar lógica de toggle e links depois */}
      {/* {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLinkMobile href="/(marketing)">Home</NavLinkMobile>
            <NavLinkMobile href="/(marketing)/sobre">Sobre Nós</NavLinkMobile>
            <NavLinkMobile href="/(marketing)/contato">Contato</NavLinkMobile>
            <NavLinkMobile href="/(marketing)/faq">FAQ</NavLinkMobile>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
                <Link href="/login" className="block w-full text-left bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium">
                    Acessar App
                </Link>
                <Link href="/signup" className="block w-full text-left bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-base font-medium">
                    Cadastre-se
                </Link>
            </div>
          </div>
        </div>
      )} */}
    </header>
  );
};

// Helper para links mobile se precisar de estilização diferente
// const NavLinkMobile: React.FC<NavLinkProps> = ({ href, children }) => {
//   return (
//     <Link href={href} className="block text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors">
//       {children}
//     </Link>
//   );
// };

export default MarketingHeader;
