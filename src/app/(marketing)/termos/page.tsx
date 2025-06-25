import React from 'react';

export const metadata = {
  title: 'Termos de Serviço - Mania Malhas',
  description: 'Leia os Termos de Serviço para utilização da plataforma Mania Malhas.',
};

export default function TermosPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-10 space-y-6 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
      {/*
        A classe 'prose' do plugin Tailwind Typography é útil para estilizar blocos de HTML
        gerados por CMS ou Markdown. Aqui, usaremos para texto longo.
        https://tailwindcss.com/docs/typography-plugin
      */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        Termos de Serviço
      </h1>

      <p className="text-sm text-gray-500">Última atualização: 06 de Agosto de 2024</p>

      <p>Bem-vindo à Mania Malhas! Estes Termos de Serviço ("Termos") regem o seu uso da nossa plataforma online e serviços relacionados (coletivamente, o "Serviço"), fornecidos pela Mania Malhas ("nós", "nosso" ou "a Empresa"). Ao acessar ou usar o nosso Serviço, você concorda em cumprir estes Termos.</p>

      <h2>1. Aceitação dos Termos</h2>
      <p>Ao criar uma conta, acessar ou usar o Serviço de qualquer forma, você confirma que leu, entendeu e concorda em ficar vinculado por estes Termos. Se você não concorda com qualquer parte dos termos, então você não pode acessar o Serviço.</p>

      <h2>2. Descrição do Serviço</h2>
      <p>A Mania Malhas é uma plataforma de software como serviço (SaaS) projetada para auxiliar na gestão de confecções e malharias, incluindo, mas não se limitando a, controle de estoque, planejamento de produção, gestão de pedidos e relacionamento com clientes e fornecedores.</p>

      <h2>3. Contas de Usuário</h2>
      <p>Para acessar certas funcionalidades do Serviço, você pode ser obrigado a criar uma conta. Você é responsável por manter a confidencialidade de sua senha e informações da conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>
      <p>Você deve fornecer informações precisas, atuais e completas durante o processo de registro e manter essas informações atualizadas.</p>

      <h2>4. Uso Aceitável</h2>
      <p>Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes Termos. Você não pode:</p>
      <ul>
        <li>Usar o Serviço de qualquer forma que possa danificar, desabilitar, sobrecarregar ou prejudicar o Serviço ou interferir no uso e aproveitamento do Serviço por qualquer outra parte.</li>
        <li>Tentar obter acesso não autorizado a qualquer parte do Serviço, outras contas, sistemas de computador ou redes conectadas ao Serviço.</li>
        <li>Carregar ou transmitir vírus, worms ou qualquer outro software malicioso.</li>
        <li>Coletar ou armazenar dados pessoais sobre outros usuários sem o seu consentimento expresso.</li>
      </ul>

      <h2>5. Propriedade Intelectual</h2>
      <p>O Serviço e seu conteúdo original (excluindo conteúdo fornecido pelos usuários), características e funcionalidades são e permanecerão propriedade exclusiva da Mania Malhas e seus licenciadores. O Serviço é protegido por direitos autorais, marcas registradas e outras leis do Brasil e de países estrangeiros.</p>

      <h2>6. Conteúdo do Usuário</h2>
      <p>Você retém todos os direitos sobre qualquer conteúdo que você enviar, postar ou exibir no ou através do Serviço ("Conteúdo do Usuário"). Ao enviar Conteúdo do Usuário, você nos concede uma licença mundial, não exclusiva, isenta de royalties para usar, copiar, reproduzir, processar, adaptar, modificar, publicar, transmitir, exibir e distribuir tal Conteúdo do Usuário em qualquer e todos os meios ou métodos de distribuição.</p>
      <p>Você é o único responsável pelo seu Conteúdo do Usuário e pelas consequências de publicá-lo.</p>

      <h2>7. Taxas e Pagamentos (Se Aplicável)</h2>
      <p>[Esta seção seria detalhada se o serviço fosse pago. Exemplo: A Mania Malhas pode oferecer planos de assinatura pagos. Os detalhes de preços, ciclos de faturamento e políticas de reembolso serão apresentados no momento da assinatura e farão parte integrante destes Termos.]</p>
      <p><em>Placeholder: Detalhes sobre taxas, faturamento e pagamentos serão inseridos aqui conforme aplicável.</em></p>

      <h2>8. Rescisão</h2>
      <p>Podemos rescindir ou suspender seu acesso ao nosso Serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.</p>
      <p>Após a rescisão, seu direito de usar o Serviço cessará imediatamente.</p>

      <h2>9. Limitação de Responsabilidade</h2>
      <p>Em nenhuma circunstância a Mania Malhas, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar o Serviço; (ii) qualquer conduta ou conteúdo de terceiros no Serviço; (iii) qualquer conteúdo obtido do Serviço; e (iv) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo, seja com base em garantia, contrato, ato ilícito (incluindo negligência) ou qualquer outra teoria legal, tenhamos ou não sido informados da possibilidade de tais danos.</p>

      <h2>10. Isenção de Garantias</h2>
      <p>Seu uso do Serviço é por sua conta e risco. O Serviço é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL". O Serviço é fornecido sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a, garantias implícitas de comercialização, adequação a uma finalidade específica, não infração ou curso de desempenho.</p>

      <h2>11. Alterações nos Termos</h2>
      <p>Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.</p>
      <p>Ao continuar a acessar ou usar nosso Serviço após essas revisões entrarem em vigor, você concorda em ficar vinculado pelos termos revisados.</p>

      <h2>12. Contato</h2>
      <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através da nossa página de contato ou pelo email <a href="mailto:legal@maniamalhas.com.br" className="text-blue-600 hover:underline">legal@maniamalhas.com.br</a>.</p>

      <p><em>Este é um documento de Termos de Serviço de exemplo e deve ser revisado e adaptado por um profissional jurídico para atender às necessidades específicas da Mania Malhas.</em></p>
    </div>
  );
}
