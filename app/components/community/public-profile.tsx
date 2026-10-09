"use client";

import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  Code2,
  Globe2,
  Link2,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { experiments } from "../../features/missions/experiments";
import {
  getPublicProfileByHandle,
  type CommunityProfile,
} from "../../features/community/profile-data";
import { NameVerification, ProfileTags } from "./profile-tags";
import { ProfileActions } from "./profile-actions";

const socialIcons = {
  github: Code2,
  linkedin: Link2,
  instagram: AtSign,
  x: AtSign,
  website: Globe2,
};
const badgeIcons = [Radar, ShieldCheck, BadgeCheck];
function labelForMission(id: string) {
  return (
    experiments.find((mission) => mission.slug === id)?.name || id.replaceAll("-", " ")
  );
}
function labelForBadge(id: string) {
  return id.replaceAll("-", " ");
}

export function PublicProfile({ handle }: { handle: string }) {
  const [profile, setProfile] = useState<CommunityProfile | null | undefined>(
    undefined,
  );
  useEffect(() => {
    getPublicProfileByHandle(handle)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [handle]);
  if (profile === undefined)
    return (
      <main className="public-profile">
        <p>Carregando perfil…</p>
      </main>
    );
  if (!profile || !profile.profileVisible)
    return (
      <main className="public-profile">
        <h1>Perfil não encontrado.</h1>
        <Link href="/">Voltar para a comunidade</Link>
      </main>
    );
  const level =
    profile.contributionCount >= 12
      ? "Investigador"
      : profile.contributionCount >= 4
        ? "Analista"
        : "Iniciante";
  const nextLevelAt =
    profile.contributionCount < 4 ? 4 : profile.contributionCount < 12 ? 12 : 24;
  const progress = Math.min(
    100,
    Math.round((profile.contributionCount / nextLevelAt) * 100),
  );
  const socialLinks = Object.entries(profile.links).filter(([, value]) => value) as [
    keyof typeof socialIcons,
    string,
  ][];
  return (
    <main className={`public-profile${profile.bannerURL ? " has-banner" : ""}`}>
      <div
        className="public-profile-banner"
        style={
          profile.bannerURL
            ? { backgroundImage: `url(${profile.bannerURL})` }
            : undefined
        }
      />
      <Link className="public-profile-brand" href="/">
        MENTO<span>CYBER</span>
      </Link>
      <section>
        <div className="public-avatar">
          {profile.photoURL ? (
            <span
              aria-label="Foto de perfil"
              role="img"
              style={{ backgroundImage: `url(${profile.photoURL})` }}
            />
          ) : (
            profile.displayName.slice(0, 2).toUpperCase()
          )}
        </div>
        <p className="auth-eyebrow">{level.toUpperCase()} / MEMBRO DA COMUNIDADE</p>
        <h1>
          {profile.displayName}
          <NameVerification tags={profile.systemTags} />
        </h1>
        <p className="public-handle">@{profile.handle}</p>
        <ProfileTags tags={profile.systemTags} />
        <ProfileActions profile={profile} />
        <p className="public-bio">
          {profile.bio || "Praticante da comunidade MentoCyber."}
        </p>
        {(profile.career.headline ||
          profile.career.certifications.length > 0 ||
          profile.career.projects.length > 0) && (
          <section className="public-career">
            <span>CARREIRA / PORTFÓLIO</span>
            {profile.career.headline && <b>{profile.career.headline}</b>}
            {profile.career.availability && <p>{profile.career.availability}</p>}
            {profile.career.certifications.length > 0 && (
              <div>
                {profile.career.certifications.map((item) => (
                  <i key={item}>{item}</i>
                ))}
              </div>
            )}
            {profile.career.projects.length > 0 && (
              <ul>
                {profile.career.projects.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        )}
        {profile.specialties.length > 0 && (
          <div className="public-skill-group">
            <span>ESPECIALIDADES</span>
            <p className="public-tags">
              {profile.specialties.map((item) => (
                <i key={item}>{item}</i>
              ))}
            </p>
          </div>
        )}
        {profile.stack.length > 0 && (
          <div className="public-skill-group">
            <span>STACK</span>
            <p className="public-tags">
              {profile.stack.map((item) => (
                <i key={item}>{item}</i>
              ))}
            </p>
          </div>
        )}
        {profile.showActivity && (
          <section className="public-progression">
            <div>
              <span>PROGRESSÃO</span>
              <b>
                {profile.contributionCount} / {nextLevelAt} registros
              </b>
            </div>
            <i>
              <em style={{ width: `${progress}%` }} />
            </i>
            <small>
              {profile.contributionCount >= 12
                ? "Prática consistente registrada na rede."
                : `${nextLevelAt - profile.contributionCount} registros para a próxima leitura de prática.`}
            </small>
          </section>
        )}
        {profile.showActivity && profile.recentMissionIds.length > 0 && (
          <section className="public-recent">
            <span>ATIVIDADE RECENTE</span>
            {profile.recentMissionIds
              .slice(-3)
              .reverse()
              .map((id) => (
                <Link href={`/estudos/${id}`} key={id}>
                  <b>{labelForMission(id)}</b>
                  <small>Ver missão →</small>
                </Link>
              ))}
          </section>
        )}
        {profile.featuredMissionIds.length > 0 && (
          <section className="public-featured">
            <span>MISSÕES EM DESTAQUE</span>
            <div>
              {profile.featuredMissionIds.map((id) => (
                <Link href={`/estudos/${id}`} key={id}>
                  {labelForMission(id)} <b>↗</b>
                </Link>
              ))}
            </div>
          </section>
        )}
        {profile.featuredBadgeIds.length > 0 && (
          <section className="public-featured public-featured-badges">
            <span>CONQUISTAS EM DESTAQUE</span>
            <div>
              {profile.featuredBadgeIds.map((id, index) => {
                const Icon = badgeIcons[index % badgeIcons.length];
                return (
                  <p key={id}>
                    <Icon size={16} />
                    {labelForBadge(id)}
                  </p>
                );
              })}
            </div>
          </section>
        )}
        {profile.showSocialLinks && socialLinks.length > 0 && (
          <div className="public-links">
            {socialLinks.map(([name, value]) => {
              const Icon = socialIcons[name];
              return (
                <a
                  aria-label={name}
                  href={value}
                  key={name}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon size={16} />
                  <span>{name === "website" ? "Portfólio" : name}</span>
                </a>
              );
            })}
          </div>
        )}
        {profile.helpRequest && (
          <aside className="public-help">
            <b>Procura colaboração em</b>
            <p>{profile.helpRequest}</p>
          </aside>
        )}
        <div className="public-badges">
          {profile.badgeIds.slice(0, 3).map((id, index) => {
            const Icon = badgeIcons[index % badgeIcons.length];
            return (
              <div className="public-badge" key={id}>
                <Icon size={16} />
                <span>{labelForBadge(id)}</span>
              </div>
            );
          })}
        </div>
        <dl>
          <div>
            <dt>MISSÕES</dt>
            <dd>{profile.completedMissionIds.length}</dd>
          </div>
          {profile.showActivity && (
            <div>
              <dt>REGISTROS</dt>
              <dd>{profile.contributionCount}</dd>
            </div>
          )}
          <div>
            <dt>CONQUISTAS</dt>
            <dd>{profile.badgeIds.length}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
