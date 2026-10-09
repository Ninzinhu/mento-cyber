"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getContentPosts } from "../../features/content/content-data";
import type { ContentPost } from "../../features/content/content-model";
import { SiteHeader } from "../shell/site-header";

const hubs = [
  "SOC",
  "DFIR",
  "Threat Hunting",
  "AppSec",
  "Cloud Security",
  "OSINT",
  "GRC",
];
const hrefFor = (post: ContentPost) =>
  post.kind === "radar"
    ? `/noticias/${post.slug}`
    : post.kind === "discussion"
      ? `/discussoes/${post.slug}`
      : `/artigos/${post.slug}`;

export function SpecialtyHubs() {
  const params = useSearchParams();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [selected, setSelected] = useState(params.get("tag") || hubs[0]);
  useEffect(() => {
    void getContentPosts().then(setPosts);
  }, []);
  const visible = useMemo(
    () => posts.filter((post) => post.tags.includes(selected)).slice(0, 12),
    [posts, selected],
  );
  return (
    <main className="specialty-page">
      <SiteHeader />
      <section className="specialty-hero">
        <p className="auth-eyebrow">HUBS / ESPECIALIDADES</p>
        <h1>Aprenda dentro de um contexto.</h1>
        <p>
          Cada hub reúne notícias, discussões e leituras úteis para a frente que você
          quer praticar.
        </p>
      </section>
      <section className="specialty-tabs" aria-label="Selecionar especialidade">
        {hubs.map((hub) => (
          <button
            className={selected === hub ? "is-active" : ""}
            key={hub}
            onClick={() => setSelected(hub)}
            type="button"
          >
            {hub}
          </button>
        ))}
      </section>
      <section className="specialty-feed">
        <div>
          <p className="auth-eyebrow">{selected.toUpperCase()}</p>
          <h2>Leituras recentes</h2>
        </div>
        {visible.length ? (
          visible.map((post) => (
            <Link href={hrefFor(post)} key={post.id}>
              <span>
                {post.kind === "radar"
                  ? "NOTÍCIA"
                  : post.kind === "discussion"
                    ? "DISCUSSÃO"
                    : "ARTIGO"}
              </span>
              <b>{post.title}</b>
              <p>{post.excerpt}</p>
            </Link>
          ))
        ) : (
          <p className="content-empty">
            Ainda estamos formando a curadoria deste hub. Explore a base ou abra uma
            discussão sobre o tema.
          </p>
        )}
      </section>
    </main>
  );
}
