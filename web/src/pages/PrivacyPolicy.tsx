import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "ola@pauloruan.dev"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="bg-white rounded-xs border border-zinc-200 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              Politica de Privacidade
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Ultima atualizacao: 30 de junho de 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Informacoes gerais
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              A plataforma <strong>Minha Casa</strong> respeita a sua
              privacidade e esta comprometida em proteger os dados pessoais dos
              seus usuarios. Esta Politica de Privacidade descreve como
              coletamos, usamos, armazenamos e protegemos suas informacoes, em
              conformidade com a Lei Geral de Protecao de Dados (LGPD — Lei
              nº 13.709/2018).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              2. Dados coletados
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Ao utilizar o Minha Casa, coletamos os seguintes dados pessoais:
            </p>
            <div className="bg-zinc-50 rounded-xs p-4 space-y-2">
              <p className="text-sm text-zinc-600">
                <strong>Dados obtidos via Google OAuth:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
                <li>Identificador unico do Google (Google ID)</li>
                <li>Nome completo</li>
                <li>Endereco de e-mail</li>
                <li>Foto de perfil</li>
              </ul>
            </div>
            <div className="bg-zinc-50 rounded-xs p-4 space-y-2">
              <p className="text-sm text-zinc-600">
                <strong>Dados informados pelo usuario:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
                <li>Chave PIX (opcional)</li>
              </ul>
            </div>
            <div className="bg-zinc-50 rounded-xs p-4 space-y-2">
              <p className="text-sm text-zinc-600">
                <strong>Dados gerados pelo uso da plataforma:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
                <li>Dados de contas (nome, valor, data de vencimento, status)</li>
                <li>Dados de eventos (nome, descricao, data, endereco, participantes)</li>
                <li>Itens de lista de desejos (titulo, URL, imagem)</li>
                <li>Notificacoes enviadas dentro da plataforma</li>
                <li>Codigo de convite da casa</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              3. Finalidade do uso dos dados
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Autenticacao e acesso a conta via Google OAuth</li>
              <li>Identificacao do usuario dentro da plataforma</li>
              <li>Gerenciamento de contas, eventos e listas da casa compartilhada</li>
              <li>Envio de notificacoes sobre atividades da casa</li>
              <li>Exibicao do perfil aos outros moradores da mesma casa</li>
              <li>Comunicacao entre moradores (ex.: chave PIX para pagamentos)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              4. Cookies e autenticacao
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              O Minha Casa utiliza cookies tecnicos essenciais para o
              funcionamento da autenticacao, como o cookie de estado OAuth
              (<code className="bg-zinc-100 px-1 rounded">oauthstate</code>)
              durante o processo de login com o Google. Apos o login, a
              autenticacao e mantida por meio de tokens JWT armazenados no
              localStorage do navegador. Nao utilizamos cookies de rastreamento
              ou publicidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              5. Compartilhamento de dados
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Seus dados pessoais sao compartilhados apenas com os outros
              moradores da mesma casa na plataforma. Nao vendemos, alugamos ou
              compartilhamos seus dados com terceiros para fins comerciais. Os
              dados sao armazenados em servidores seguros e o acesso e
              restrito por meio de autenticacao.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              6. Seguranca dos dados
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Adotamos medidas de seguranca para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Comunicacao via HTTPS</li>
              <li>Autenticacao baseada em tokens JWT com expiracao</li>
              <li>Acesso restrito aos dados por meio de autenticacao obrigatoria</li>
              <li>Armazenamento em banco de dados com controle de acesso</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              7. Retencao de dados
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Seus dados pessoais sao mantidos enquanto sua conta estiver ativa.
              Ao excluir sua conta, todos os seus dados pessoais sao removidos
              do nosso banco de dados de forma permanente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              8. Seus direitos (LGPD)
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              De acordo com a Lei Geral de Protecao de Dados, voce tem o
              direito de:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Confirmar a existencia de tratamento dos seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusao dos seus dados pessoais</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Para exercer seus direitos, entre em contato pelo e-mail
              indicado na secao de contato desta politica.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              9. Exclusao de conta
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Voce pode solicitar a exclusao da sua conta a qualquer momento
              atraves da plataforma. Ao excluir sua conta, todos os seus dados
              pessoais e associacoes com casas serao removidos de forma
              permanente e irreversivel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              10. Alteracoes nesta politica
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Podemos atualizar esta Politica de Privacidade periodicamente.
              Quaisquer alteracoes serao publicadas nesta pagina com a data da
              ultima atualizacao. Recomendamos que voce revise esta politica
              regularmente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              11. Contato
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Se voce tiver duvidas ou preocupacoes sobre esta Politica de
              Privacidade ou sobre o tratamento dos seus dados pessoais, entre
              em contato conosco pelo e-mail:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-zinc-900 underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
