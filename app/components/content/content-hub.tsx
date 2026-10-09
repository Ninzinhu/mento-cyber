"use client";

/* eslint-disable @next/next/no-img-element -- Public RSS feeds use varying image hosts. */

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Languages,
  MessageSquareText,
  Radio,
} from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
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

  const refreshPosts = async () => {
    setLoading(true);
    const nextPosts = await getContentPosts();
    setPosts(nextPosts);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void getContentPosts().then((nextPosts) => {
      if (!active) return;
      setPosts(nextPosts);
      setLoading(false);
    });
    return () => {
      active = false;
    };
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
        <p className="auth-eyebrow">
          {initialKind === "radar"
            ? "NOTÍCIAS / CYBERSEGURANÇA"
            : "BASE VIVA / COMUNIDADE"}
        </p>
        <h1>
          {initialKind === "radar"
            ? "Notícias de cyber, sempre na fonte."
            : "Leitura que vira conversa e prática."}
        </h1>
        <p>
          {initialKind === "radar"
            ? "Atualizações internacionais selecionadas automaticamente. Cada item abre a publicação original."
            : "Artigos, notícias internacionais e discussões técnicas em um só lugar. Toda notícia aponta para a fonte original."}
        </p>
        <div className="content-hero-actions">
          <Link href="/discussoes">
            Abrir uma discussão <ArrowUpRight size={15} />
          </Link>
          <Link href="/newsletter">
            Receber notícias <ArrowUpRight size={15} />
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
          <div className="content-empty">
            <p>
              {kind === "radar"
                ? "Nenhuma notícia disponível com estes filtros."
                : "Nenhum conteúdo encontrado com estes filtros."}
            </p>
            <button onClick={refreshPosts} type="button">
              Atualizar lista
            </button>
          </div>
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
        <Link href="/noticias">Notícias</Link>
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
        : post.sourceUrl || "/noticias";
  const external = post.kind === "radar" && Boolean(post.sourceUrl);
  const openPost = () => {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.assign(href);
  };
  const openFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPost();
    }
  };
  const translateUrl = post.sourceUrl
    ? `https://translate.google.com/translate?sl=auto&tl=pt&u=${encodeURIComponent(post.sourceUrl)}`
    : undefined;
  const openTranslation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!post.sourceUrl) return;
    const browserLanguage = navigator.language.split("-")[0] || "pt";
    const target = `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(browserLanguage)}&u=${encodeURIComponent(post.sourceUrl)}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={`content-card content-card-${post.kind} ${external ? "content-card-open" : ""}`}
      onClick={external ? openPost : undefined}
      onKeyDown={external ? openFromKeyboard : undefined}
      role={external ? "link" : undefined}
      tabIndex={external ? 0 : undefined}
    >
      {post.imageUrl ? (
        <div className="content-card-image" aria-hidden="true">
          <img alt="" loading="lazy" src={post.imageUrl} />
        </div>
      ) : null}
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
        <div className="content-card-actions">
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            rel={external ? "noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {external ? "Ler fonte" : post.kind === "discussion" ? "Participar" : "Ler"}{" "}
            <ArrowUpRight size={14} />
          </Link>
          {translateUrl ? (
            <a
              className="content-translate"
              href={translateUrl}
              onClick={openTranslation}
              rel="noreferrer"
              target="_blank"
              title="Traduzir para o idioma do navegador"
            >
              <Languages size={14} /> Traduzir
            </a>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
