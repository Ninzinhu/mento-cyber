"use client";

import { FormEvent, useState } from "react";
import { ContentNav } from "./content-hub";
import { communityAction } from "../../features/community/server-action";
import { contentTags } from "../../features/content/content-model";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [topics, setTopics] = useState<string[]>(["Incidentes", "Vulnerabilidades"]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    try {
      await communityAction("newsletter.subscribe", { email, topics });
      setNotice(
        "Recebemos sua inscrição. A confirmação será ativada quando o provedor de e-mail estiver conectado.",
      );
      setEmail("");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu e-mail.",
      );
    } finally {
      setPending(false);
    }
  }
  function toggleTopic(topic: string) {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : current.length < 6
          ? [...current, topic]
          : current,
    );
  }
  return (
    <main className="content-page">
      <ContentNav />
      <section className="newsletter-hero">
        <p className="auth-eyebrow">NEWSLETTER / SINAL DA SEMANA</p>
        <h1>O que importa nas notícias, sem ruído.</h1>
        <p>
          Uma seleção editorial de artigos, discussões e fontes confiáveis do
          ecossistema de segurança.
        </p>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
              type="email"
              value={email}
            />
          </label>
          <fieldset className="newsletter-topics">
            <legend>Quais assuntos você quer acompanhar?</legend>
            <div>
              {contentTags.slice(0, 12).map((topic) => (
                <label key={topic}>
                  <input
                    checked={topics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                    type="checkbox"
                  />
                  {topic}
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={pending} type="submit">
            {pending ? "Registrando…" : "Quero receber"}
          </button>
        </form>
        {notice && <p aria-live="polite">{notice}</p>}
        <small>
          Preferências salvas com sua inscrição. A entrega só começa após a confirmação
          por e-mail.
        </small>
      </section>
    </main>
  );
}
