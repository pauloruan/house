import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "ola@pauloruan.dev"

export default function TermsOfService() {
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
              Termos de Servico
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Ultima atualizacao: 30 de junho de 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Aceitacao dos termos
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Ao acessar e utilizar a plataforma <strong>Minha Casa</strong>,
              voce concorda com estes Termos de Servico. Se voce nao concordar
              com algum dos termos aqui descritos, nao devera utilizar a
              plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              2. Descricao do servico
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              O Minha Casa e uma plataforma de gerenciamento domestico que
              permite aos moradores de uma residencia compartilhada:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Gerenciar contas e despesas da casa</li>
              <li>Criar e acompanhar eventos</li>
              <li>Manter uma lista de desejos compartilhada</li>
              <li>Enviar e receber notificacoes entre moradores</li>
              <li>Compartilhar informacoes como chave PIX para pagamentos</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              3. Cadastro e conta
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Para utilizar o Minha Casa, voce precisa criar uma conta atraves
              da autenticacao com sua conta do Google. Ao se cadastrar, voce
              concorda em fornecer informacoes verdadeiras e atualizadas. Voce
              e responsavel por manter a seguranca da sua conta e por todas as
              atividades realizadas atraves dela.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              4. Uso aceitavel
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Ao utilizar o Minha Casa, voce se compromete a:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Utilizar a plataforma apenas para fins legitimos</li>
              <li>Nao compartilhar codigos de convite com pessoas nao autorizadas</li>
              <li>Nao utilizar a plataforma para atividades ilegais ou prejudiciais</li>
              <li>Nao tentar acessar dados de outros usuarios sem autorizacao</li>
              <li>Nao interferir no funcionamento da plataforma</li>
              <li>Respeitar os demais moradores da casa</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              5. Casas e convites
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Cada casa possui um codigo de convite unico que permite que novos
              moradores se juntem. Ao ingressar em uma casa, voce tera acesso
              as informacoes compartilhadas por todos os moradores daquela
              residencia, incluindo contas, eventos, notificacoes e lista de
              desejos.
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Voce pode sair de uma casa a qualquer momento. Ao sair, voce
              perdera acesso as informacoes daquela casa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              6. Propriedade intelectual
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              O conteudo, design, codigo e demais elementos da plataforma Minha
              Casa sao de propriedade exclusiva do criador do projeto. Voce nao
              pode copiar, modificar, distribuir ou criar obras derivadas com
              base na plataforma sem autorizacao previa por escrito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              7. Limitacao de responsabilidade
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              O Minha Casa e fornecido "como esta", sem garantias de qualquer
              tipo, expressas ou implicitas. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1 ml-2">
              <li>Perda de dados ou interrupcoes no servico</li>
              <li>Decisoes financeiras tomadas com base nas informacoes da plataforma</li>
              <li>Disputas entre moradores sobre contas ou eventos</li>
              <li>Danos decorrentes do uso ou da impossibilidade de uso da plataforma</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              8. Exclusao de conta
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Voce pode solicitar a exclusao da sua conta a qualquer momento.
              Ao excluir sua conta, todos os seus dados pessoais serao
              removidos de forma permanente. Caso voce seja o unico morador de
              uma casa, a casa tambem sera removida.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              9. Alteracoes nos termos
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Reservamo-nos o direito de alterar estes Termos de Servico a
              qualquer momento. As alteracoes entrarao em vigor imediatamente
              apos a publicacao nesta pagina. O uso continuado da plataforma
              apos as alteracoes constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              10. Legislacao aplicavel
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Estes Termos de Servico sao regidos pelas leis da Republica
              Federativa do Brasil. Quaisquer disputas decorrentes destes
              termos serao resolvidas no foro da comarca de domicilio do
              usuario.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900">
              11. Contato
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Se voce tiver duvidas sobre estes Termos de Servico, entre em
              contato conosco pelo e-mail:{" "}
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
