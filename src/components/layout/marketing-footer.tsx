import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Exemplo de ícones

const MarketingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1: Sobre / Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Mania Malhas</h3>
            <p className="text-gray-600 text-sm mb-4">
              Simplificando a gestão para a sua confecção.
            </p>
            {/* Pode adicionar mais links aqui se necessário */}
          </div>

          {/* Coluna 2: Links Importantes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/(marketing)/sobre" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/(marketing)/contato" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/(marketing)/faq" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Legal / Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Legal</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <Link href="/(marketing)/termos" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link href="/(marketing)/privacidade" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Siga-nos</h3>
            <div className="flex space-x-4">
              {/* Substitua '#' pelos links reais das redes sociais */}
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <FaFacebook size={20} />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Twitter">
                <FaTwitter size={20} />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} Mania Malhas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
