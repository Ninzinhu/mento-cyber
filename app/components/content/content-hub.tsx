"use client";

/* eslint-disable @next/next/no-img-element -- Public RSS feeds use varying image hosts. */

import Link from "next/link";
import { ArrowUpRight, BookOpenText, MessageSquareText, Radio } from "lucide-react";
import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import { getContentPosts } from "../../features/content/content-data";
import {
  contentLabel,
  contentTags,
  formatContentDate,
  type ContentKind,
  type ContentPost,
} from "../../features/content/content-model";
import { getCommunityProfile } from "../../features/community/profile-data";
import { observeCommunityMember } from "../../features/community/community-data";
import { ArticleComposer } from "./article-composer";

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
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [interestTags, setInterestTags] = useState<string[]>([]);

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

  useEffect(
    () =>
      observeCommunityMember((member) => {
        setSignedIn(Boolean(member));
        if (!member) {
          setInterestTags([]);
          return;
        }
        void getCommunityProfile(member.uid)
          .then((profile) =>
            setInterestTags([...profile.specialties, ...profile.stack].slice(0, 12)),
          )
          .catch(() => setInterestTags([]));
      }),
    [],
  );

  const visible = useMemo(
    () =>
      posts.filter((post) => {
        const haystack =
          `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.sourceName || ""}`.toLowerCase();
        return (
          (kind === "all" || post.kind === kind) &&
          (tag === "Todos" || post.tags.includes(tag)) &&
          (region === "Todas" || post.region === region) &&
          (!search.trim() || haystack.includes(search.trim().toLowerCase()))
        );
      }),
    [kind, posts, region, search, tag],
  );
  const featured = useMemo(
    () => posts.filter((post) => post.featured).slice(0, 3),
    [posts],
  );
  const forYou = useMemo(
    () =>
      interestTags.length
        ? posts
            .filter((post) => post.tags.some((item) => interestTags.includes(item)))
            .slice(0, 3)
        : [],
    [interestTags, posts],
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
      {initialKind === "all" && signedIn && (
        <ArticleComposer onPublished={refreshPosts} />
      )}
      {initialKind === "all" && !signedIn && (
        <section className="content-signin content-write-cta">
          <b>Tem uma leitura ou método para compartilhar?</b>
          <Link href="/entrar">Entre para publicar um artigo →</Link>
        </section>
      )}
      {(featured.length > 0 || forYou.length > 0) && initialKind === "all" && (
        <section className="content-curation">
          {featured.length > 0 && (
            <div>
              <p className="auth-eyebrow">DESTAQUES DA SEMANA</p>
              <div className="content-curation-list">
                {featured.map((post) => (
                  <ContentCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
          {forYou.length > 0 && (
            <div>
              <p className="auth-eyebrow">PARA VOCÊ</p>
              <p className="content-curation-copy">
                Baseado nas especialidades e ferramentas do seu perfil.
              </p>
              <div className="content-curation-list">
                {forYou.map((post) => (
                  <ContentCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
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
        {initialKind === "radar" && (
          <label>
            Região
            <select onChange={(event) => setRegion(event.target.value)} value={region}>
              <option>Todas</option>
              <option>Brasil</option>
              <option>Global</option>
            </select>
          </label>
        )}
        <label className="content-search">
          Pesquisar
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="CVE, malware, vazamento…"
            type="search"
            value={search}
          />
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
        <Link href="/operacoes">Operações</Link>
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
        : `/noticias/${post.slug}`;
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackImage = `/api/noticias/arte?source=${encodeURIComponent(
    post.sourceName || contentLabel(post.kind),
  )}&title=${encodeURIComponent(post.title)}`;
  const imageSource = post.imageUrl && !imageFailed ? post.imageUrl : fallbackImage;
  const openPost = () => {
    window.location.assign(href);
  };
  const openFromKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPost();
    }
  };

  return (
    <article
      className={`content-card content-card-${post.kind} content-card-open`}
      onClick={openPost}
      onKeyDown={openFromKeyboard}
      role="link"
      tabIndex={0}
    >
      <div className="content-card-image" aria-hidden="true">
        <img
          alt=""
          loading="lazy"
          onError={() => {
            if (post.imageUrl && !imageFailed) setImageFailed(true);
          }}
          src={imageSource}
        />
      </div>
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
          <Link href={href} onClick={(event) => event.stopPropagation()}>
            {post.kind === "radar"
              ? "Abrir notícia"
              : post.kind === "discussion"
                ? "Participar"
                : "Ler"}{" "}
            <ArrowUpRight size={14} />
          </Link>
          {post.kind === "radar" && post.sourceUrl ? (
            <a
              className="content-translate"
              href={post.sourceUrl}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer"
              target="_blank"
              title="Abrir publicação original"
            >
              Fonte <ArrowUpRight size={14} />
            </a>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
