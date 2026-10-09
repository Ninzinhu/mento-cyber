"use client";

/* eslint-disable @next/next/no-img-element -- News images come from varying public RSS hosts. */

import Link from "next/link";
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
  const [memberId, setMemberId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replyTo, setReplyTo] = useState<ContentComment | null>(null);
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
    return observeCommunityMember((member) => {
      setSignedIn(Boolean(member));
      setMemberId(member?.uid || null);
      if (!member) setSaved(false);
    });
  }, [discussionOnly, newsOnly, slug]);
  useEffect(() => {
    if (!post || !memberId) return;
    void communityAction("content.read.track", { postId: post.id }).catch(
      () => undefined,
    );
  }, [memberId, post]);
  useEffect(() => {
    if (!memberId || !post) return;
    void communityAction<{ postIds: string[] }>("content.saved.list")
      .then((data) => setSaved(data.postIds?.includes(post.id) || false))
      .catch(() => setSaved(false));
  }, [memberId, post]);
  async function comment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post || body.trim().length < 8) return;
    try {
      await communityAction("content.comment.create", {
        postId: post.id,
        body,
        parentCommentId: replyTo?.id || "",
      });
      setBody("");
      setReplyTo(null);
      setComments(await getContentComments(post.id));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível responder agora.",
      );
    }
  }
  async function react() {
    if (!post) return;
    try {
      await communityAction("content.reaction.toggle", {
        postId: post.id,
        enabled: true,
      });
      setPost({ ...post, reactionCount: Math.max(1, (post.reactionCount || 0) + 1) });
      setReacted(true);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível registrar o apoio.",
      );
    }
  }
  async function report(targetId: string, targetType: "post" | "comment") {
    const reason = window.prompt("Qual é o motivo da denúncia?");
    if (!reason) return;
    try {
      await communityAction("content.report", { targetId, targetType, reason });
      setNotice("Denúncia recebida. A equipe fará a triagem.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível enviar a denúncia.",
      );
    }
  }
  async function toggleSaved() {
    if (!post) return;
    try {
      await communityAction("content.save.toggle", {
        postId: post.id,
        enabled: !saved,
      });
      setSaved((current) => !current);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível salvar este item.",
      );
    }
  }
  async function markBest(commentId: string) {
    if (!post) return;
    try {
      await communityAction("content.comment.best", { postId: post.id, commentId });
      setPost({ ...post, bestCommentId: commentId });
      setComments((items) =>
        items.map((item) => ({ ...item, bestAnswer: item.id === commentId })),
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível destacar a resposta.",
      );
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
        <h1>{post.title}</h1>
        <div className="content-detail-meta">
          {post.authorName} · {formatContentDate(post.publishedAt)} ·{" "}
          {post.readingMinutes || 2} min
        </div>
        <div className="content-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="content-detail-body">{post.body || post.excerpt}</p>
        {post.whyItMatters && (
          <aside className="content-why-it-matters">
            <b>Por que isso importa</b>
            <p>{post.whyItMatters}</p>
          </aside>
        )}
        {post.kind === "radar" && (
          <section className="content-translation">
            <div>
              <b>Leitura em outros idiomas</b>
              <span>
                Use a tradução nativa do seu navegador ao abrir a fonte original. Assim
                não dependemos de uma API paga nem enviamos seu conteúdo a outro
                serviço.
              </span>
            </div>
          </section>
        )}
        <div className="content-detail-actions">
          {signedIn ? (
            <button disabled={reacted} onClick={react} type="button">
              {reacted ? "Apoiado" : "Apoiar"}{" "}
              {post.reactionCount ? `· ${post.reactionCount}` : ""}
            </button>
          ) : (
            <Link href="/entrar">Entre para apoiar</Link>
          )}
          {signedIn && (
            <button
              className="content-quiet-action"
              onClick={toggleSaved}
              type="button"
            >
              {saved ? "Salvo" : "Salvar para depois"}
            </button>
          )}
          {signedIn && (
            <button
              className="content-quiet-action"
              onClick={() => report(post.id, "post")}
              type="button"
            >
              Denunciar
            </button>
          )}
        </div>
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
        {post.referenceUrl && (
          <a
            className="content-source"
            href={post.referenceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Abrir referência compartilhada ↗
          </a>
        )}
        {notice && <p aria-live="polite">{notice}</p>}
      </article>
      {post.kind === "discussion" && (
        <section className="content-comments">
          <h2>Respostas</h2>
          {comments.map((item) => (
            <article key={item.id}>
              <b>
                {item.authorName}
                {post.bestCommentId === item.id ? " · Melhor resposta" : ""}
              </b>
              <span>{formatContentDate(item.createdAt)}</span>
              <p>{item.body}</p>
              {signedIn && (
                <div className="content-comment-actions">
                  <button onClick={() => setReplyTo(item)} type="button">
                    Responder
                  </button>
                  {post.authorId === memberId && post.bestCommentId !== item.id && (
                    <button onClick={() => markBest(item.id)} type="button">
                      Marcar como melhor
                    </button>
                  )}
                  <button
                    className="content-quiet-action"
                    onClick={() => report(item.id, "comment")}
                    type="button"
                  >
                    Denunciar
                  </button>
                </div>
              )}
            </article>
          ))}
          {signedIn ? (
            <form onSubmit={comment}>
              {replyTo && (
                <p className="content-replying">
                  Respondendo a <b>{replyTo.authorName}</b>{" "}
                  <button onClick={() => setReplyTo(null)} type="button">
                    Cancelar
                  </button>
                </p>
              )}
              <textarea
                minLength={8}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Contribua com contexto, evidência ou uma pergunta útil. Use @usuario para mencionar alguém."
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
