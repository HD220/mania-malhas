import React from 'react';

export const metadata = {
  title: 'FAQ - Perguntas Frequentes - Mania Malhas',
  description: 'Encontre respostas para as dúvidas mais comuns sobre a Mania Malhas.',
};

// Exemplo de dados para o FAQ. Em um app real, viria de um CMS ou DB.
const faqData = [
  {
    question: 'O que é a Mania Malhas?',
    answer: 'Mania Malhas é uma plataforma de gestão completa para confecções e malharias, ajudando a otimizar processos desde a matéria-prima até a entrega final do produto.',
  },
  {
    question: 'Para quem é a Mania Malhas?',
    answer: 'Nossa plataforma é ideal para pequenas e médias confecções que buscam mais controle, eficiência e dados para tomar decisões inteligentes em seus negócios.',
  },
  {
    question: 'Preciso instalar algum software?',
    answer: 'Não! A Mania Malhas é uma plataforma 100% online (SaaS - Software as a Service). Você pode acessá-la de qualquer dispositivo com internet e um navegador moderno.',
  },
  {
    question: 'Existe um período de teste gratuito?',
    answer: 'Sim! Oferecemos um período de teste para que você possa experimentar todas as funcionalidades da Mania Malhas sem compromisso. Consulte nossa página de cadastro para mais detalhes.',
  },
  {
    question: 'Como funciona o suporte?',
    answer: 'Nosso suporte está disponível através de email e chat online diretamente na plataforma para clientes ativos. Também temos uma base de conhecimento e tutoriais para ajudar você a tirar o máximo proveito da ferramenta.',
  },
];

// Um componente simples para o item do FAQ (poderia ser mais elaborado com acordeão)
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  return (
    <details className="group border-b border-gray-200 py-4">
      <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
        <span className="text-lg text-gray-800 group-hover:text-blue-600">{question}</span>
        <span className="transition group-open:rotate-180">
          <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
        </span>
      </summary>
      <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
        {answer}
      </p>
    </details>
  );
};


export default function FaqPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-10 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Perguntas Frequentes (FAQ)
      </h1>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <FaqItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>

      <div className="text-center pt-8 mt-8 border-t border-gray-200">
        <p className="text-lg text-gray-700 mb-3">Não encontrou o que procurava?</p>
        <a
          href="/(marketing)/contato" // Usar Link do Next.js idealmente
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Entre em Contato Conosco
        </a>
      </div>
    </div>
  );
}
