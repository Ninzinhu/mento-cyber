"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Compass, Mail, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { observeCommunityMember } from "../../features/community/community-data";
import { getCommunityProfile } from "../../features/community/profile-data";
import { communityAction } from "../../features/community/server-action";
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
const events = [
  ["TER", "Briefing de notícias", "18:30", "/noticias"],
  ["QUI", "Plantão de discussão", "19:00", "/discussoes"],
  ["SÁB", "Sessão de labs", "10:00", "/labs"],
] as const;

function hrefFor(post: ContentPost) {
  return post.kind === "radar"
    ? `/noticias/${post.slug}`
    : post.kind === "discussion"
      ? `/discussoes/${post.slug}`
      : `/artigos/${post.slug}`;
}

export function CommunityCenter() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    void getContentPosts().then(setPosts);
    return observeCommunityMember((member) => {
      setSignedIn(Boolean(member));
      if (!member) return setSavedIds([]);
      void getCommunityProfile(member.uid).then((profile) =>
        setTags([...profile.specialties, ...profile.stack]),
      );
      void communityAction<{ postIds: string[] }>("content.saved.list")
        .then((data) => setSavedIds(data.postIds || []))
        .catch(() => setSavedIds([]));
    });
  }, []);
  const recommended = useMemo(
    () =>
      posts
        .filter((post) => !tags.length || post.tags.some((tag) => tags.includes(tag)))
        .slice(0, 4),
    [posts, tags],
  );
  const saved = useMemo(
    () => posts.filter((post) => savedIds.includes(post.id)).slice(0, 4),
    [posts, savedIds],
  );
  const digest = useMemo(
    () => posts.filter((post) => post.kind === "radar").slice(0, 3),
    [posts],
  );
  return (
    <main className="community-center">
      <SiteHeader />
      <section className="community-center__hero">
        <p className="auth-eyebrow">COMUNIDADE / SEU PONTO DE PARTIDA</p>
        <h1>O que importa para a sua prática, agora.</h1>
        <p>
          Leituras, pessoas, encontros e próximos passos reunidos sem transformar a
          comunidade em um feed infinito.
        </p>
        <div>
          <Link href="/conteudos#publicar">Publicar uma ideia →</Link>
          <Link href="/membros">Encontrar pessoas →</Link>
        </div>
      </section>
      <section className="community-center__layout">
        <div className="community-feed">
          <div className="section-kicker">
            <Sparkles size={16} />
            <span>PARA VOCÊ</span>
          </div>
          <h2>Leituras com contexto.</h2>
          {recommended.map((post) => (
            <Link className="community-post" href={hrefFor(post)} key={post.id}>
              <span>
                {post.kind === "radar"
                  ? "NOTÍCIA"
                  : post.kind === "discussion"
                    ? "DISCUSSÃO"
                    : "ARTIGO"}
              </span>
              <b>{post.title}</b>
              <small>{post.tags.join(" · ")}</small>
            </Link>
          ))}
        </div>
        <aside className="community-digest">
          <div className="section-kicker">
            <Mail size={16} />
            <span>DIGEST DA SEMANA</span>
          </div>
          <h2>O radar em três leituras.</h2>
          {digest.map((post) => (
            <Link href={hrefFor(post)} key={post.id}>
              {post.title}
            </Link>
          ))}
          <Link className="community-digest__action" href="/newsletter">
            Ajustar meu digest →
          </Link>
        </aside>
      </section>
      <section className="community-collections">
        <article>
          <div className="section-kicker">
            <Bookmark size={16} />
            <span>LER DEPOIS</span>
          </div>
          <h2>{signedIn ? "Sua coleção privada." : "Salve leituras para depois."}</h2>
          {signedIn ? (
            saved.length ? (
              <div>
                {saved.map((post) => (
                  <Link href={hrefFor(post)} key={post.id}>
                    {post.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p>Nenhum item salvo. Use o marcador nas leituras que quer retomar.</p>
            )
          ) : (
            <Link href="/entrar">Entre para criar sua coleção →</Link>
          )}
        </article>
        <article>
          <div className="section-kicker">
            <Compass size={16} />
            <span>HUBS DE ESPECIALIDADE</span>
          </div>
          <h2>Escolha uma frente.</h2>
          <div className="community-hubs">
            {hubs.map((hub) => (
              <Link href={`/especialidades?tag=${encodeURIComponent(hub)}`} key={hub}>
                {hub}
              </Link>
            ))}
          </div>
        </article>
        <article>
          <div className="section-kicker">
            <CalendarDays size={16} />
            <span>PRÓXIMOS ENCONTROS</span>
          </div>
          <h2>Aprender junto tem hora.</h2>
          {events.map(([day, name, hour, href]) => (
            <Link className="community-event" href={href} key={name}>
              <b>{day}</b>
              <span>
                {name}
                <small>{hour}</small>
              </span>
            </Link>
          ))}
          <Link className="community-digest__action" href="/agenda">
            Abrir agenda →
          </Link>
        </article>
      </section>
    </main>
  );
}
