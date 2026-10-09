"use client";

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
}: {
  slug: string;
  discussionOnly?: boolean;
}) {
  const [post, setPost] = useState<ContentPost | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [body, setBody] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    getContentPosts().then((items) => {
      const current =
        items.find(
          (item) =>
            item.slug === slug && (!discussionOnly || item.kind === "discussion"),
        ) || null;
      setPost(current);
      if (current) getContentComments(current.id).then(setComments);
    });
    return observeCommunityMember((member) => setSignedIn(Boolean(member)));
  }, [discussionOnly, slug]);
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
  if (!post)
    return (
      <main className="content-page">
        <ContentNav />
        <p className="content-empty">Carregando conteúdo ou item não encontrado.</p>
      </main>
    );
  return (
    <main className="content-page">
      <ContentNav />
      <article className="content-detail">
        <Link href={post.kind === "discussion" ? "/discussoes" : "/conteudos"}>
          ← Voltar
        </Link>
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
