"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ContentCard, ContentNav } from "./content-hub";
import { getContentPosts } from "../../features/content/content-data";
import { contentTags, type ContentPost } from "../../features/content/content-model";
import { communityAction } from "../../features/community/server-action";
import { observeCommunityMember } from "../../features/community/community-data";

export function DiscussionBoard() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("SOC");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    getContentPosts("discussion").then(setPosts);
    return observeCommunityMember((member) => setSignedIn(Boolean(member)));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    try {
      await communityAction("content.discussion.create", {
        title,
        content: body,
        tags: [tag],
        referenceUrl,
      });
      setTitle("");
      setBody("");
      setReferenceUrl("");
      setNotice("Discussão publicada. Ela já está disponível para a comunidade.");
      setPosts(await getContentPosts("discussion"));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível publicar agora.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="content-page">
      <ContentNav />
      <section className="content-section-head">
        <div>
          <p className="auth-eyebrow">CONVERSAS DA COMUNIDADE</p>
          <h1>Traga o contexto. A comunidade ajuda a investigar.</h1>
          <p>
            Perguntas técnicas, decisões de carreira e leituras de cenário. Sem
            credenciais, alvos ou dados de terceiros.
          </p>
        </div>
      </section>
      {signedIn ? (
        <form className="discussion-composer" onSubmit={submit}>
          <label>
            Título
            <input
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Qual ponto você quer discutir?"
              required
              value={title}
            />
          </label>
          <label>
            Contexto
            <textarea
              maxLength={1200}
              minLength={20}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Explique o cenário, o que você observou e onde precisa de ajuda."
              required
              value={body}
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
          <label>
            Referência segura <small>(opcional, somente HTTPS)</small>
            <input
              onChange={(event) => setReferenceUrl(event.target.value)}
              placeholder="https://documentação-ou-fonte.exemplo"
              type="url"
              value={referenceUrl}
            />
          </label>
          <button disabled={pending} type="submit">
            {pending ? "Publicando…" : "Abrir discussão"}
          </button>
          {notice && <p aria-live="polite">{notice}</p>}
        </form>
      ) : (
        <section className="content-signin">
          <b>Entre para abrir ou responder discussões.</b>
          <Link href="/entrar">Entrar na comunidade →</Link>
        </section>
      )}
      <section className="content-grid">
        {posts.map((post) => (
          <ContentCard key={post.id} post={post} />
        ))}
        {!posts.length && (
          <p className="content-empty">
            Ainda não há discussões. Seja quem abre a primeira.
          </p>
        )}
      </section>
    </main>
  );
}
