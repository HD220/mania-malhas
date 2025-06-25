import React from 'react';

export const metadata = {
  title: 'Mania Malhas - Bem-vindo!',
  // description: 'Página inicial da Mania Malhas.', // Pode herdar ou sobrescrever
};

export default function MarketingHomePage() {
  return (
    <div className="space-y-6">
      <section className="text-center py-12 bg-white shadow rounded-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bem-vindo à Mania Malhas!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          A solução completa para otimizar a gestão da sua confecção, desde o fio até a peça final.
        </p>
        <div className="space-x-4">
          <a
            href="/signup" // Idealmente usar Link do Next.js se não for para rota externa
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            Comece Agora (Cadastro)
          </a>
          <a
            href="/login" // Idealmente usar Link do Next.js
            className="bg-transparent hover:bg-gray-100 text-blue-600 font-semibold px-8 py-3 rounded-lg text-lg border border-blue-600 transition-colors"
          >
            Já Tenho Conta
          </a>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Nossos Diferenciais</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Gestão Integrada</h3>
            <p className="text-gray-600">Controle todas as etapas da sua produção em um só lugar.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Relatórios Inteligentes</h3>
            <p className="text-gray-600">Tome decisões baseadas em dados precisos e atualizados.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Fácil de Usar</h3>
            <p className="text-gray-600">Interface intuitiva pensada para a rotina da confecção.</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white shadow rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Pronto para Transformar sua Gestão?</h2>
        <p className="text-lg text-center text-gray-600 mb-8">
          Junte-se a centenas de confecções que já estão otimizando seus processos com Mania Malhas.
        </p>
        <div className="text-center">
          <a
            href="/signup"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-10 py-4 rounded-lg text-xl transition-colors"
          >
            Quero me Cadastrar!
          </a>
        </div>
      </section>
    </div>
  );
}
