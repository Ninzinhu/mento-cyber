import Link from "next/link";
import { SiteHeader } from "../components/shell/site-header";

const events = [
  [
    "Terças",
    "Briefing de notícias",
    "18:30",
    "Leituras rápidas do radar e perguntas para continuar a conversa.",
    "/noticias",
  ],
  [
    "Quintas",
    "Plantão de discussão",
    "19:00",
    "Espaço para hipóteses, bloqueios técnicos e revisão entre pares.",
    "/discussoes",
  ],
  [
    "Sábados",
    "Sessão de labs",
    "10:00",
    "Prática guiada em cenário isolado, com tempo para documentação.",
    "/labs",
  ],
] as const;
export const metadata = { title: "Agenda | MentoCyber" };
export default function AgendaPage() {
  return (
    <main className="agenda-page">
      <SiteHeader />
      <section>
        <p className="auth-eyebrow">AGENDA / COMUNIDADE</p>
        <h1>Encontros para manter a prática em movimento.</h1>
        <p>Rotina previsível, participação opcional e foco em conversas úteis.</p>
      </section>
      <div>
        {events.map(([day, title, hour, description, href]) => (
          <article key={title}>
            <span>
              {day}
              <b>{hour}</b>
            </span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <Link href={href}>Participar →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
