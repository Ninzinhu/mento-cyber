"use client";

/* eslint-disable @next/next/no-img-element -- News images come from varying public RSS hosts. */

import Link from "next/link";
import { Languages } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ContentNav } from "./content-hub";
import {
  getContentComments,
  getContentPosts,
  type ContentComment,
} from "../../features/content/content-data";
import {
  contentLabel,
  formatContentDate,
  type ContentPost,
} from "../../features/content/content-model";
import { observeCommunityMember } from "../../features/community/community-data";
import { communityAction } from "../../features/community/server-action";

export function ContentDetail({
  slug,
  discussionOnly = false,
  newsOnly = false,
}: {
  slug: string;
  discussionOnly?: boolean;
  newsOnly?: boolean;
}) {
  const [post, setPost] = useState<ContentPost | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [body, setBody] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState("");
  const [translation, setTranslation] = useState<{
    language: string;
    title: string;
    excerpt: string;
  } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    getContentPosts().then((items) => {
      const current =
        items.find(
          (item) =>
            item.slug === slug &&
            (!discussionOnly || item.kind === "discussion") &&
            (!newsOnly || item.kind === "radar"),
        ) || null;
      setPost(current);
      setImageFailed(false);
      if (current) getContentComments(current.id).then(setComments);
    });
    return observeCommunityMember((member) => setSignedIn(Boolean(member)));
  }, [discussionOnly, newsOnly, slug]);
  async function comment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post || body.trim().length < 8) return;
    try {
      await communityAction("content.comment.create", { postId: post.id, body });
      setBody("");
      setComments(await getContentComments(post.id));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível responder agora.",
      );
    }
  }
  async function translateNews() {
    if (!post) return;
    const language = navigator.language.split("-")[0]?.toLowerCase() || "pt";
    const cached = post.translations?.[language];
    if (cached) {
      setTranslation({ language, ...cached });
      return;
    }
    setTranslating(true);
    setNotice("");
    try {
      const result = await communityAction<{
        translation: { language: string; title: string; excerpt: string };
      }>("content.news.translate", { postId: post.id, language });
      setTranslation(result.translation);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível traduzir agora.",
      );
    } finally {
      setTranslating(false);
    }
  }
  if (!post)
    return (
      <main className="content-page">
        <ContentNav />
        <p className="content-empty">Carregando conteúdo ou item não encontrado.</p>
      </main>
    );
  const fallbackImage = `/api/noticias/arte?source=${encodeURIComponent(
    post.sourceName || contentLabel(post.kind),
  )}&title=${encodeURIComponent(post.title)}`;
  const imageSource = post.imageUrl && !imageFailed ? post.imageUrl : fallbackImage;
  return (
    <main className="content-page">
      <ContentNav />
      <article className="content-detail">
        <Link
          href={
            post.kind === "discussion"
              ? "/discussoes"
              : post.kind === "radar"
                ? "/noticias"
                : "/conteudos"
          }
        >
          ← Voltar
        </Link>
        <div className="content-detail-image" aria-hidden="true">
          <img
            alt=""
            onError={() => {
              if (post.imageUrl && !imageFailed) setImageFailed(true);
            }}
            src={imageSource}
          />
        </div>
        <p className="auth-eyebrow">{contentLabel(post.kind).toUpperCase()}</p>
        <h1>{translation?.title || post.title}</h1>
        <div className="content-detail-meta">
          {post.authorName} · {formatContentDate(post.publishedAt)} ·{" "}
          {post.readingMinutes || 2} min
        </div>
        <div className="content-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="content-detail-body">
          {translation?.excerpt || post.body || post.excerpt}
        </p>
        {post.kind === "radar" && (
          <section className="content-translation">
            <div>
              <b>Tradução no MentoCyber</b>
              <span>
                Traduzimos título e resumo; a matéria completa permanece na fonte
                original.
              </span>
            </div>
            {signedIn ? (
              <button disabled={translating} onClick={translateNews} type="button">
                <Languages size={15} />
                {translating ? "Traduzindo…" : "Traduzir para meu idioma"}
              </button>
            ) : (
              <Link href="/entrar">Entre para traduzir</Link>
            )}
          </section>
        )}
        {post.sourceUrl && (
          <a
            className="content-source"
            href={post.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Abrir fonte original: {post.sourceName || "referência externa"} ↗
          </a>
        )}
        {notice && <p aria-live="polite">{notice}</p>}
      </article>
      {post.kind === "discussion" && (
        <section className="content-comments">
          <h2>Respostas</h2>
          {comments.map((item) => (
            <article key={item.id}>
              <b>{item.authorName}</b>
              <span>{formatContentDate(item.createdAt)}</span>
              <p>{item.body}</p>
            </article>
          ))}
          {signedIn ? (
            <form onSubmit={comment}>
              <textarea
                minLength={8}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Contribua com contexto, evidência ou uma pergunta útil."
                required
                value={body}
              />
              <button type="submit">Responder</button>
            </form>
          ) : (
            <p>
              <Link href="/entrar">Entre</Link> para responder.
            </p>
          )}
          {notice && <p aria-live="polite">{notice}</p>}
        </section>
      )}
    </main>
  );
}
