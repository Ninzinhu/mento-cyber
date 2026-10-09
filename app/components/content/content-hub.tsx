"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpenText, MessageSquareText, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getContentPosts } from "../../features/content/content-data";
import {
  contentLabel,
  contentTags,
  formatContentDate,
  type ContentKind,
  type ContentPost,
} from "../../features/content/content-model";

const kinds: Array<ContentKind | "all"> = ["all", "article", "discussion", "radar"];

const iconFor = (kind: ContentKind) =>
  kind === "article" ? (
    <BookOpenText size={17} />
  ) : kind === "discussion" ? (
    <MessageSquareText size={17} />
  ) : (
    <Radio size={17} />
  );

export function ContentHub({
  initialKind = "all",
}: {
  initialKind?: ContentKind | "all";
}) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [kind, setKind] = useState<ContentKind | "all">(initialKind);
  const [tag, setTag] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContentPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      posts.filter(
        (post) =>
          (kind === "all" || post.kind === kind) &&
          (tag === "Todos" || post.tags.includes(tag)),
      ),
    [kind, posts, tag],
  );

  return (
    <main className="content-page">
      <ContentNav />
      <section className="content-hero">
        <p className="auth-eyebrow">BASE VIVA / COMUNIDADE</p>
        <h1>Leitura que vira conversa e prática.</h1>
        <p>
          Artigos, radar mundial e discussões técnicas em um só lugar. Toda notícia
          aponta para a fonte original.
        </p>
        <div className="content-hero-actions">
          <Link href="/discussoes">
            Abrir uma discussão <ArrowUpRight size={15} />
          </Link>
          <Link href="/newsletter">
            Receber o radar <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="content-filters" aria-label="Filtrar conteúdo">
        <div>
          {kinds.map((item) => (
            <button
              className={kind === item ? "active" : ""}
              key={item}
              onClick={() => setKind(item)}
              type="button"
            >
              {item === "all" ? "Tudo" : contentLabel(item)}
            </button>
          ))}
        </div>
        <label>
          Assunto
          <select onChange={(event) => setTag(event.target.value)} value={tag}>
            <option>Todos</option>
            {contentTags.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>
      <section className="content-grid" aria-live="polite">
        {loading ? (
          <p className="content-empty">Carregando a base de conteúdo…</p>
        ) : (
          visible.map((post) => <ContentCard key={post.id} post={post} />)
        )}
        {!loading && !visible.length && (
          <p className="content-empty">Nenhum conteúdo encontrado com estes filtros.</p>
        )}
      </section>
    </main>
  );
}

export function ContentNav() {
  return (
    <header className="profile-topbar content-topbar">
      <Link className="auth-brand" href="/">
        MENTO<span>CYBER</span>
      </Link>
      <nav>
        <Link href="/conteudos">Conteúdos</Link>
        <Link href="/discussoes">Discussões</Link>
        <Link href="/radar">Radar</Link>
        <Link href="/newsletter">Newsletter</Link>
        <Link href="/perfil">Perfil</Link>
      </nav>
    </header>
  );
}

export function ContentCard({ post }: { post: ContentPost }) {
  const href =
    post.kind === "discussion"
      ? `/discussoes/${post.slug}`
      : post.kind === "article"
        ? `/artigos/${post.slug}`
        : post.sourceUrl || "/radar";
  const external = post.kind === "radar" && Boolean(post.sourceUrl);
  return (
    <article className={`content-card content-card-${post.kind}`}>
      <div className="content-card-kind">
        {iconFor(post.kind)}
        <span>{contentLabel(post.kind)}</span>
        {post.sourceName && <small>{post.sourceName}</small>}
      </div>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <div className="content-tags">
        {post.tags.slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <footer>
        <span>
          {post.authorName} · {formatContentDate(post.publishedAt)}
        </span>
        <Link
          href={href}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {external ? "Ler fonte" : post.kind === "discussion" ? "Participar" : "Ler"}{" "}
          <ArrowUpRight size={14} />
        </Link>
      </footer>
    </article>
  );
}
