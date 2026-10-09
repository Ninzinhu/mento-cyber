import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="wrap nav">
      <Link className="brand" href="/">
        MENTO<span>CYBER</span>
      </Link>
      <nav className="navlinks" aria-label="Navegação principal">
        <a href="#biblioteca">Base aberta</a>
        <Link href="/conteudos">Conteúdos</Link>
        <Link href="/noticias">Notícias</Link>
        <Link href="/operacoes">Operações</Link>
        <Link href="/estudos">Missões</Link>
        <Link href="/labs">Labs</Link>
        <Link href="/perfil">Perfil</Link>
        <Link className="action nav-join" href="/registro">
          Participar
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-content">
        <span className="brand">
          MENTO<span>CYBER</span>
        </span>
        <span>Comunidade de prática em defesa digital.</span>
      </div>
    </footer>
  );
}
