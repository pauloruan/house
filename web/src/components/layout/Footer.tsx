export function Footer() {
  // O Vite usa import.meta.env para ler variáveis. Adicionamos fallbacks por segurança.
  const issueUrl = import.meta.env.VITE_GITHUB_ISSUE_URL || "#"
  const portfolioUrl =
    import.meta.env.VITE_PORTFOLIO_URL || "https://pauloruan.vercel.app"

  return (
    <footer className="mt-8 py-6 flex flex-col items-center justify-center gap-2 border-t border-zinc-200 text-sm text-zinc-500 text-center">
      <p>
        Encontrou algum bug?{" "}
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline font-medium"
        >
          Reporte aqui
        </a>
        .
      </p>
      <p>
        Desenvolvido com ☕ por{" "}
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-900 hover:underline"
        >
          Paulo Ruan
        </a>
      </p>
    </footer>
  )
}
