"use client";

import Link from "next/link";
import { Bell, Menu, Plus, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { observeCommunityMember } from "../../features/community/community-data";
import {
  getCommunityProfile,
  type CommunityProfile,
} from "../../features/community/profile-data";
import { communityAction } from "../../features/community/server-action";
import { getContentPosts } from "../../features/content/content-data";
import type { ContentPost } from "../../features/content/content-model";

const navigation = [
  ["Conteúdos", "/conteudos"],
  ["Notícias", "/noticias"],
  ["Operações", "/operacoes"],
  ["Missões", "/estudos"],
  ["Labs", "/labs"],
] as const;

type Alert = { id: string; title: string; href?: string; kind?: string };

function contentHref(post: ContentPost) {
  if (post.kind === "radar") return `/noticias/${post.slug}`;
  if (post.kind === "discussion") return `/discussoes/${post.slug}`;
  return `/artigos/${post.slug}`;
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [member, setMember] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    void getContentPosts().then(setPosts);
    return observeCommunityMember((user) => {
      if (!user) {
        setMember(null);
        setAlerts([]);
        return;
      }
      void getCommunityProfile(user.uid)
        .then(setMember)
        .catch(() => setMember(null));
      void communityAction<{ alerts: Alert[] }>("community.dashboard")
        .then((data) => setAlerts(data.alerts || []))
        .catch(() => setAlerts([]));
    });
  }, []);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return posts
      .filter((post) =>
        `${post.title} ${post.excerpt} ${post.tags.join(" ")}`
          .toLowerCase()
          .includes(value),
      )
      .slice(0, 5);
  }, [posts, query]);
  const level = member ? Math.floor(member.xp / 100) + 1 : 1;

  return (
    <header className={`site-header ${compact ? "site-header--compact" : ""}`}>
      <div className="wrap site-header__inner">
        <Link className="brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav
          className={menuOpen ? "site-header__nav is-open" : "site-header__nav"}
          aria-label="Navegação principal"
        >
          {navigation.map(([label, href]) => (
            <Link
              className={pathname === href ? "is-active" : ""}
              href={href}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className={pathname === "/membros" ? "is-active" : ""}
            href="/membros"
            onClick={() => setMenuOpen(false)}
          >
            Pessoas
          </Link>
        </nav>
        <div className="site-header__actions">
          <button
            aria-label="Buscar no MentoCyber"
            className="site-header__icon"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            <Search size={18} />
          </button>
          {member ? (
            <>
              <div className="site-header__alerts">
                <button
                  aria-label="Abrir alertas"
                  className="site-header__icon"
                  onClick={() => setAlertOpen((open) => !open)}
                  type="button"
                >
                  <Bell size={18} />
                  {alerts.length > 0 && <i>{Math.min(alerts.length, 9)}</i>}
                </button>
                {alertOpen && (
                  <div className="site-header__popover">
                    <b>Atualizações para você</b>
                    {alerts.length ? (
                      alerts.slice(0, 4).map((alert) => (
                        <Link
                          href={alert.href || "/operacoes"}
                          key={alert.id}
                          onClick={() => setAlertOpen(false)}
                        >
                          {alert.title}
                        </Link>
                      ))
                    ) : (
                      <span>Você está em dia.</span>
                    )}
                  </div>
                )}
              </div>
              <Link
                className="site-header__member"
                href="/perfil"
                title="Abrir seu perfil"
              >
                <span>
                  {member.photoURL ? (
                    <img alt="" src={member.photoURL} />
                  ) : (
                    member.displayName.slice(0, 2).toUpperCase()
                  )}
                </span>
                <small>
                  NÍVEL {level}
                  <b>{member.xp} XP</b>
                </small>
              </Link>
              <Link className="site-header__create" href="/conteudos#publicar">
                <Plus size={16} />
                Criar
              </Link>
            </>
          ) : (
            <Link className="action nav-join" href="/registro">
              Participar
            </Link>
          )}
          <button
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
            className="site-header__menu"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {searchOpen && (
        <div
          className="site-search"
          role="dialog"
          aria-modal="true"
          aria-label="Busca global"
        >
          <div className="site-search__panel">
            <div>
              <Search size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar notícias, artigos e discussões"
              />
              <button
                aria-label="Fechar busca"
                onClick={() => setSearchOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <p>{query ? "Resultados" : "Procure por CVE, phishing, SOC, carreira…"}</p>
            {results.map((post) => (
              <Link
                href={contentHref(post)}
                key={post.id}
                onClick={() => setSearchOpen(false)}
              >
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
            {query && !results.length && (
              <p>
                Nenhum resultado. Tente outra palavra ou explore os hubs de
                especialidade.
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
