"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  BadgeCheck,
  Crosshair,
  FileSearch,
  Radar,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import {
  leaveCommunity,
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";
import {
  getCommunityProfile,
  syncPublicProfile,
  type CommunityProfile,
} from "../../features/community/profile-data";
import { getProfileProgress } from "../../features/community/progression";
import { ContributionMap } from "./contribution-map";
import { ContributionHistory } from "./contribution-history";
import { MissionTree } from "../missions/mission-tree";
import { experiments } from "../../features/missions/experiments";
import { FavoriteMissions } from "../missions/favorite-missions";
import { NameVerification, ProfileTags } from "./profile-tags";
import { ProfileOnboarding } from "./profile-onboarding";

const AuthField = dynamic(
  () => import("../visuals/auth-field").then((module) => module.AuthField),
  { ssr: false },
);

const badges: {
  id: string;
  icon: LucideIcon;
  label: string;
  detail: string;
  condition: string;
}[] = [
  {
    id: "first-signal",
    icon: Radar,
    label: "Primeiro sinal",
    detail: "Ativou sua presença na comunidade.",
    condition: "Perfil publicado",
  },
  {
    id: "first-contribution",
    icon: Waypoints,
    label: "Primeiro pacote",
    detail: "Enviou uma evidência para a rede.",
    condition: "1 contribuição",
  },
  {
    id: "field-notes",
    icon: FileSearch,
    label: "Notas de campo",
    detail: "Transformou observação em registro útil.",
    condition: "3 registros",
  },
  {
    id: "peer-review",
    icon: ShieldCheck,
    label: "Defesa em pares",
    detail: "Passou uma decisão pela revisão coletiva.",
    condition: "1 revisão",
  },
  {
    id: "signal-hunter",
    icon: Crosshair,
    label: "Caçador de sinais",
    detail: "Identificou um padrão que merece atenção.",
    condition: "Sinal validado",
  },
  {
    id: "incident-trace",
    icon: BadgeCheck,
    label: "Rastro de incidente",
    detail: "Reconstruiu uma sequência investigativa.",
    condition: "Rastro concluído",
  },
];
function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "MC"
  );
}

export function ProfileWorkspace() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(
    () =>
      observeCommunityMember((nextMember) => {
        setMember(nextMember);
        if (!nextMember) {
          setProfile(null);
          setLoading(false);
          return;
        }
        setLoading(true);
        getCommunityProfile(nextMember.uid)
          .then((loadedProfile) => {
            setProfile(loadedProfile);
            return syncPublicProfile(loadedProfile);
          })
          .catch(() => setMessage("Não foi possível carregar o seu perfil."))
          .finally(() => setLoading(false));
      }),
    [],
  );
  if (!firebaseEnabled)
    return (
      <main className="profile-page">
        <p>Firebase ainda não está configurado neste ambiente.</p>
      </main>
    );
  if (loading)
    return (
      <main className="profile-page">
        <p className="profile-loading">Carregando seu espaço…</p>
      </main>
    );
  if (!member || !profile)
    return (
      <main className="profile-page profile-gate">
        <p className="auth-eyebrow">ÁREA DO MEMBRO</p>
        <h1>Seu perfil começa na comunidade.</h1>
        <p>Entre ou crie uma conta para registrar a sua prática.</p>
        <div>
          <Link className="profile-primary" href="/entrar">
            Entrar
          </Link>
          <Link className="profile-secondary" href="/registro">
            Criar perfil
          </Link>
        </div>
      </main>
    );
  const progression = getProfileProgress(profile);
  return (
    <main className="profile-page profile-dashboard">
      <div className="profile-background" aria-hidden="true">
        <AuthField />
      </div>
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/estudos">Missões</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/membros">Membros</Link>
          <Link href="/perfil/conexoes">Conexões</Link>
          <Link href="/perfil/convites">Convites</Link>
          <Link href="/perfil/configuracoes">Configurações</Link>
          <button onClick={() => leaveCommunity()} type="button">
            Sair
          </button>
        </nav>
      </header>
      <section className="profile-hero">
        <div
          className="profile-banner"
          style={
            profile.bannerURL
              ? { backgroundImage: `url(${profile.bannerURL})` }
              : undefined
          }
        />
        <div className="profile-identity">
          <div className="profile-avatar">
            {profile.photoURL ? (
              <span
                aria-label="Foto de perfil"
                className="profile-photo"
                role="img"
                style={{ backgroundImage: `url(${profile.photoURL})` }}
              />
            ) : (
              initials(profile.displayName)
            )}
          </div>
          <div>
            <p className="auth-eyebrow">MEMBRO / {profile.role.toUpperCase()}</p>
            <h1>
              {profile.displayName}
              <NameVerification tags={profile.systemTags} />
            </h1>
            <p>@{profile.handle || "membro"}</p>
            <ProfileTags tags={profile.systemTags} />
          </div>
          <dl>
            <div>
              <dt>MISSÕES</dt>
              <dd>{profile.completedMissionIds.length}</dd>
            </div>
            <div>
              <dt>REGISTROS</dt>
              <dd>{profile.contributionCount}</dd>
            </div>
            <div>
              <dt>BADGES</dt>
              <dd>{profile.badgeIds.length}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="profile-command-grid">
        <article className="profile-panel profile-status-card">
          <p className="auth-eyebrow">ESTADO DA PRÁTICA</p>
          <strong>
            {profile.contributionCount
              ? "Em movimento"
              : "Aguardando primeiro registro"}
          </strong>
          <p>
            {profile.contributionCount
              ? "Sua atividade já compõe a memória da comunidade."
              : "Escolha uma missão aberta e registre uma primeira evidência."}
          </p>
          <Link href="/labs">
            Abrir mapa de labs <span>→</span>
          </Link>
        </article>
        <article className="profile-panel profile-next-card">
          <div>
            <p className="auth-eyebrow">
              {profile.activeMissionIds.length ? "EM ANDAMENTO" : "PRÓXIMAS MISSÕES"}
            </p>
            <h2>
              {profile.activeMissionIds.length
                ? "Continue de onde parou."
                : "Escolha um ponto de partida."}
            </h2>
          </div>
          <ol>
            {(profile.activeMissionIds.length
              ? experiments.filter((mission) =>
                  profile.activeMissionIds.includes(mission.slug),
                )
              : experiments.slice(0, 3)
            )
              .slice(0, 3)
              .map((mission) => (
                <li key={mission.slug}>
                  <span>{mission.number}</span>
                  <Link href={`/estudos/${mission.slug}`}>
                    {mission.name}
                    <i>→</i>
                  </Link>
                </li>
              ))}
          </ol>
        </article>
      </section>
      <div className="profile-layout">
        <section className="profile-panel profile-about">
          <div className="profile-panel-heading">
            <p className="auth-eyebrow">
              NÍVEL {String(progression.level.rank).padStart(2, "0")} / PROGRESSÃO
            </p>
            <h2>{progression.level.label}</h2>
          </div>
          <div className="xp-overview">
            <div>
              <span>XP ATUAL</span>
              <strong>{progression.xp} XP</strong>
            </div>
            <div>
              <span>
                {progression.next
                  ? `PRÓXIMO: ${progression.next.label.toUpperCase()}`
                  : "NÍVEL MÁXIMO"}
              </span>
              <b>
                {progression.next
                  ? `${progression.xpToNext} XP restantes`
                  : "Prática consolidada"}
              </b>
            </div>
            <i>
              <em style={{ width: `${progression.percent}%` }} />
            </i>
          </div>
          <p className="profile-bio-summary">
            {profile.bio ||
              "Defina sua bio para apresentar a sua prática à comunidade."}
          </p>
          <div className="profile-links">
            {profile.links.github && (
              <a href={profile.links.github} rel="noreferrer" target="_blank">
                GitHub <span>↗</span>
              </a>
            )}
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} rel="noreferrer" target="_blank">
                LinkedIn <span>↗</span>
              </a>
            )}
            {profile.links.instagram && (
              <a href={profile.links.instagram} rel="noreferrer" target="_blank">
                Instagram <span>↗</span>
              </a>
            )}
            {profile.links.x && (
              <a href={profile.links.x} rel="noreferrer" target="_blank">
                X <span>↗</span>
              </a>
            )}
            {profile.links.website && (
              <a href={profile.links.website} rel="noreferrer" target="_blank">
                Portfólio <span>↗</span>
              </a>
            )}
            <Link href={`/perfil/${profile.handle}`}>
              Ver perfil público <span>↗</span>
            </Link>
            <Link href="/perfil/configuracoes">
              Editar presença <span>→</span>
            </Link>
          </div>
        </section>
        <aside className="profile-panel achievement-panel">
          <div className="profile-panel-heading">
            <p className="auth-eyebrow">CONQUISTAS</p>
            <h2>Marcos técnicos</h2>
          </div>
          <div className="badge-grid">
            {badges.map((badge) => {
              const Icon = badge.icon;
              const earned = profile.badgeIds.includes(badge.id);
              return (
                <article
                  className={
                    earned
                      ? `badge badge-earned badge-${badge.id}`
                      : `badge badge-${badge.id}`
                  }
                  key={badge.id}
                >
                  <span className="badge-mark" aria-hidden="true">
                    <Icon size={21} strokeWidth={1.7} />
                  </span>
                  <div className="badge-copy">
                    <strong>{badge.label}</strong>
                    <p>{badge.detail}</p>
                  </div>
                  <small>{earned ? "CONQUISTADA" : badge.condition}</small>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
      <ProfileOnboarding profile={profile} />
      <ContributionMap uid={member.uid} />
      <section className="profile-activity-grid">
        <ContributionHistory uid={member.uid} />
        <FavoriteMissions
          initialFavorites={profile.favoriteMissionIds}
          missions={experiments.slice(0, 4)}
          uid={member.uid}
        />
      </section>
      <section className="profile-panel profile-tree-section">
        <div className="profile-panel-heading">
          <p className="auth-eyebrow">MISSÕES</p>
          <h2>Labs e missões em andamento</h2>
          <p>
            Uma árvore de prática para avançar, registrar evidência e levar a leitura
            para os pares.
          </p>
        </div>
        <MissionTree
          activeMissionIds={profile.activeMissionIds}
          completedMissionIds={profile.completedMissionIds}
          uid={member.uid}
        />
      </section>
    </main>
  );
}
