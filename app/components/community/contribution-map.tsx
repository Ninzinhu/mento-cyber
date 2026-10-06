"use client";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../features/community/firebase";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ContributionMap({ uid }: { uid: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!db) return;
    getDocs(
      query(
        collection(db, "contributions"),
        where("authorId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(365),
      ),
    )
      .then((snapshot) => {
        const next: Record<string, number> = {};
        snapshot.forEach((item) => {
          const createdAt = item.data().createdAt;
          if (createdAt instanceof Timestamp) {
            const key = dayKey(createdAt.toDate());
            next[key] = (next[key] || 0) + 1;
          }
        });
        setCounts(next);
      })
      .catch(() => setCounts({}));
  }, [uid]);
  const days = useMemo(
    () =>
      Array.from({ length: 364 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (363 - index));
        const count = counts[dayKey(date)] || 0;
        return {
          key: dayKey(date),
          label: `${date.toLocaleDateString("pt-BR")}: ${count} contribuição${count === 1 ? "" : "ões"}`,
          level: Math.min(count, 4),
        };
      }),
    [counts],
  );
  const activeDays = Object.keys(counts).length;
  return (
    <section className="contribution-map" aria-labelledby="map-title">
      <div className="contribution-map-heading">
        <div>
          <p className="auth-eyebrow">ATIVIDADE</p>
          <h2 id="map-title">Mapa de contribuições</h2>
        </div>
        <span>
          {activeDays} dia{activeDays === 1 ? "" : "s"} com registros
        </span>
      </div>
      <div
        className="contribution-grid"
        role="grid"
        aria-label="Contribuições dos últimos doze meses"
      >
        {days.map((day) => (
          <span
            aria-label={day.label}
            className={`contribution-day level-${day.level}`}
            key={day.key}
            role="gridcell"
            title={day.label}
          />
        ))}
      </div>
      <div className="contribution-legend">
        <span>Menos</span>
        <i className="level-0" />
        <i className="level-1" />
        <i className="level-2" />
        <i className="level-3" />
        <i className="level-4" />
        <span>Mais</span>
      </div>
    </section>
  );
}
