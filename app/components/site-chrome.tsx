export function SiteHeader() {
  return (
    <>
      <div className="topline">
        <div className="wrap">
          <span>MENTOCYBER / FORMAÇÃO EM DEFESA DIGITAL</span>
          <span>Conteúdo gratuito + mentorias práticas</span>
        </div>
      </div>
      <header className="wrap nav">
        <a className="brand" href="#inicio">
          MENTO<span>CYBER</span>
        </a>
        <nav className="navlinks" aria-label="Navegação principal">
          <a href="#biblioteca">Biblioteca</a>
          <a href="#trilhas">Trilhas</a>
          <a href="#pratica">Prática</a>
          <a href="#turmas">Turmas</a>
          <a className="action" href="#acesso">
            Começar sem custo
          </a>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-content">
        <span className="brand">
          MENTO<span>CYBER</span>
        </span>
        <span>Formação responsável para defesa digital.</span>
      </div>
    </footer>
  );
}
