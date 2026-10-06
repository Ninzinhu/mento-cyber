"use client";

import Link from "next/link";
import { Bookmark, UsersRound, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  leaveCommunity,
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";
import {
  getCommunityProfile,
  type CommunityProfile,
} from "../../features/community/profile-data";
import {
  getProfilesByIds,
  listProfileFollows,
  type ProfileFollow,
} from "../../features/community/profile-network";

function PeopleList({
  profiles,
  empty,
}: {
  profiles: CommunityProfile[];
  empty: string;
}) {
  return (
    <div className="people-list">
      {profiles.length ? (
        profiles.map((profile) => (
          <Link href={`/perfil/${profile.handle}`} key={profile.uid}>
            <span>
              {profile.photoURL ? (
                <i style={{ backgroundImage: `url(${profile.photoURL})` }} />
              ) : (
                profile.displayName.slice(0, 2).toUpperCase()
              )}
            </span>
            <div>
              <b>{profile.displayName}</b>
              <small>@{profile.handle}</small>
            </div>
            <em>Ver perfil →</em>
          </Link>
        ))
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}

export function ProfileConnections() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [following, setFollowing] = useState<CommunityProfile[]>([]);
  const [followers, setFollowers] = useState<CommunityProfile[]>([]);
  const [saved, setSaved] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (!next) {
          setLoading(false);
          return;
        }
        Promise.all([
          getCommunityProfile(next.uid),
          listProfileFollows(next.uid, "following"),
          listProfileFollows(next.uid, "followers"),
        ])
          .then(async ([profile, outgoing, incoming]) => {
            setFollowing(
              await getProfilesByIds(
                (outgoing as ProfileFollow[]).map((item) => item.followingId),
              ),
            );
            setFollowers(
              await getProfilesByIds(
                (incoming as ProfileFollow[]).map((item) => item.followerId),
              ),
            );
            setSaved(await getProfilesByIds(profile.savedProfileIds));
          })
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
        <p className="profile-loading">Carregando sua rede…</p>
      </main>
    );
  if (!member)
    return (
      <main className="profile-page profile-gate">
        <p className="auth-eyebrow">SUA REDE</p>
        <h1>Entre para acompanhar pessoas da comunidade.</h1>
        <Link className="profile-primary" href="/entrar">
          Entrar
        </Link>
      </main>
    );
  return (
    <main className="profile-page connections-page">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/perfil">Perfil</Link>
          <Link href="/membros">Membros</Link>
          <Link href="/perfil/convites">Convites</Link>
          <button onClick={() => leaveCommunity()} type="button">
            Sair
          </button>
        </nav>
      </header>
      <section className="invitations-intro">
        <p className="auth-eyebrow">REDE / CONEXÕES</p>
        <h1>Pessoas que acompanham sua prática.</h1>
        <p>
          Seguir não cria obrigações: é apenas uma forma de guardar referências e
          acompanhar trajetórias.
        </p>
      </section>
      <div className="connections-grid">
        <section className="profile-panel">
          <p className="auth-eyebrow">
            <UsersRound size={14} /> SEGUIDORES
          </p>
          <h2>{followers.length} pessoas</h2>
          <PeopleList empty="Ainda não há seguidores." profiles={followers} />
        </section>
        <section className="profile-panel">
          <p className="auth-eyebrow">
            <UserRoundCheck size={14} /> SEGUINDO
          </p>
          <h2>{following.length} pessoas</h2>
          <PeopleList
            empty="Explore membros para começar a seguir."
            profiles={following}
          />
        </section>
        <section className="profile-panel">
          <p className="auth-eyebrow">
            <Bookmark size={14} /> SALVOS
          </p>
          <h2>{saved.length} referências</h2>
          <PeopleList empty="Perfis que você salvar aparecem aqui." profiles={saved} />
        </section>
      </div>
    </main>
  );
}
