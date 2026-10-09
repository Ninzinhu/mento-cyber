"use client";

import { FormEvent, useState } from "react";
import { contentTags } from "../../features/content/content-model";
import { communityAction } from "../../features/community/server-action";

export function ArticleComposer({ onPublished }: { onPublished: () => void }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [tag, setTag] = useState<string>("SOC");
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    try {
      await communityAction("content.article.create", {
        title,
        excerpt,
        body,
        whyItMatters,
        tags: [tag],
      });
      setTitle("");
      setExcerpt("");
      setBody("");
      setWhyItMatters("");
      setNotice("Artigo publicado. Obrigado por fortalecer a base da comunidade.");
      onPublished();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível publicar agora.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="article-composer">
      <div className="article-composer-head">
        <div>
          <p className="auth-eyebrow">PUBLICAR / COMUNIDADE</p>
          <h2>Transforme uma leitura em referência.</h2>
          <p>
            Não inclua credenciais, dados de terceiros, alvos ou instruções ofensivas.
          </p>
        </div>
        <button onClick={() => setPreview((current) => !current)} type="button">
          {preview ? "Editar" : "Prévia"}
        </button>
      </div>
      {preview ? (
        <article className="article-preview">
          <p className="auth-eyebrow">{tag.toUpperCase()}</p>
          <h2>{title || "Título do seu artigo"}</h2>
          <p>{excerpt || "O resumo aparecerá aqui."}</p>
          <div>{body || "O conteúdo completo aparecerá aqui."}</div>
          {whyItMatters && (
            <aside>
              <b>Por que isso importa</b>
              <p>{whyItMatters}</p>
            </aside>
          )}
        </article>
      ) : (
        <form onSubmit={publish}>
          <label>
            Título
            <input
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>
          <label>
            Resumo
            <textarea
              maxLength={320}
              minLength={40}
              onChange={(event) => setExcerpt(event.target.value)}
              required
              value={excerpt}
            />
          </label>
          <label>
            Artigo
            <textarea
              maxLength={8000}
              minLength={180}
              onChange={(event) => setBody(event.target.value)}
              required
              value={body}
            />
          </label>
          <label>
            Por que isso importa?
            <textarea
              maxLength={400}
              onChange={(event) => setWhyItMatters(event.target.value)}
              value={whyItMatters}
            />
          </label>
          <label>
            Assunto
            <select onChange={(event) => setTag(event.target.value)} value={tag}>
              {contentTags.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button disabled={pending} type="submit">
            {pending ? "Publicando…" : "Publicar artigo"}
          </button>
        </form>
      )}
      {notice && <p aria-live="polite">{notice}</p>}
    </section>
  );
}
