"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import { updateFavoriteMissions } from "../../features/community/profile-data";
import type { Experiment } from "../../features/missions/experiments";

export function FavoriteMissions({
  uid,
  missions,
  initialFavorites,
}: {
  uid: string;
  missions: Experiment[];
  initialFavorites: string[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [pending, setPending] = useState<string | null>(null);
  async function toggle(slug: string) {
    const next = favorites.includes(slug)
      ? favorites.filter((id) => id !== slug)
      : [...favorites, slug];
    setFavorites(next);
    setPending(slug);
    try {
      await updateFavoriteMissions(uid, slug, !favorites.includes(slug));
    } catch {
      setFavorites(favorites);
    } finally {
      setPending(null);
    }
  }
  return (
    <section className="profile-panel favorites-panel">
      <div className="profile-panel-heading">
        <p className="auth-eyebrow">COLEÇÃO PESSOAL</p>
        <h2>Missões favoritas</h2>
      </div>
      <div className="favorite-list">
        {missions.map((mission) => {
          const active = favorites.includes(mission.slug);
          return (
            <article key={mission.slug}>
              <Link href={`/estudos/${mission.slug}`}>
                <span>{mission.number}</span>
                <strong>{mission.name}</strong>
              </Link>
              <button
                aria-label={`${active ? "Remover" : "Salvar"} ${mission.name} dos favoritos`}
                className={active ? "favorite-active" : ""}
                disabled={pending === mission.slug}
                onClick={() => toggle(mission.slug)}
                type="button"
              >
                <Star fill={active ? "currentColor" : "none"} size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
