import React from 'react';

export const metadata = {
  title: 'Sobre Nós - Mania Malhas',
  description: 'Conheça mais sobre a história e missão da Mania Malhas.',
};

export default function SobrePage() {
  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-10 space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        Sobre a Mania Malhas
      </h1>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Nossa Missão</h2>
        <p className="text-gray-600 leading-relaxed">
          Nossa missão na Mania Malhas é empoderar confecções de todos os tamanhos com ferramentas tecnológicas
          intuitivas e poderosas. Acreditamos que uma gestão eficiente é a chave para o crescimento sustentável
          e a criatividade no setor têxtil. Buscamos simplificar processos complexos, desde o controle de
          matéria-prima até a entrega final do produto, permitindo que nossos clientes foquem no que fazem de melhor: criar.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Nossa História</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          A Mania Malhas nasceu da observação das dificuldades enfrentadas por pequenas e médias confecções
          em gerenciar suas operações de forma eficaz. Com uma equipe apaixonada por tecnologia e pela indústria da moda,
          decidimos criar uma solução que fosse acessível, completa e verdadeiramente adaptada às necessidades
          específicas do setor.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Desde o início, nosso foco tem sido ouvir nossos usuários e evoluir constantemente nossa plataforma.
          Cada funcionalidade é pensada para resolver dores reais e agregar valor tangível ao dia a dia das confecções.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Nossos Valores</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2">
          <li><strong>Inovação:</strong> Buscar constantemente novas formas de melhorar a gestão têxtil.</li>
          <li><strong>Parceria:</strong> Trabalhar lado a lado com nossos clientes para entender e atender suas necessidades.</li>
          <li><strong>Simplicidade:</strong> Tornar a tecnologia complexa acessível e fácil de usar.</li>
          <li><strong>Qualidade:</strong> Oferecer uma plataforma robusta, confiável e segura.</li>
          <li><strong>Paixão pelo Setor:</strong> Dedicação em contribuir para o sucesso da indústria da moda.</li>
        </ul>
      </section>

      <section className="text-center mt-8">
        <a
          href="/(marketing)/contato" // Usar Link do Next.js idealmente
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Fale Conosco
        </a>
      </section>
    </div>
  );
}
