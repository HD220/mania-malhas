import React from 'react';

export const metadata = {
  title: 'Contato - Mania Malhas',
  description: 'Entre em contato com a equipe Mania Malhas.',
};

export default function ContatoPage() {
  // A lógica de envio do formulário não será implementada aqui.
  // Esta é apenas a estrutura visual.
  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-10 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
        Entre em Contato
      </h1>

      <p className="text-gray-600 leading-relaxed text-center mb-8">
        Tem alguma dúvida, sugestão ou gostaria de saber mais sobre a Mania Malhas?
        Preencha o formulário abaixo ou utilize um de nossos canais de atendimento.
      </p>

      <form className="space-y-6 ng-untouched ng-pristine ng-valid"> {/* Adicionado classes do Angular por engano, remover se não for intencional. No contexto Next.js/React, são desnecessárias. */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Seu Nome Completo
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="João Silva"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Seu Melhor Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="joao.silva@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Assunto
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Dúvida sobre funcionalidade X"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Sua Mensagem
          </label>
          <textarea
            name="message"
            id="message"
            required
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Detalhe aqui sua dúvida ou sugestão..."
          ></textarea>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            Enviar Mensagem
          </button>
        </div>
      </form>

      <div className="text-center pt-6 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Outros Canais</h3>
        <p className="text-gray-600">
          Email: <a href="mailto:contato@maniamalhas.com.br" className="text-blue-600 hover:underline">contato@maniamalhas.com.br</a>
        </p>
        {/* <p className="text-gray-600">Telefone: (XX) XXXXX-XXXX</p> */}
      </div>
    </div>
  );
}
