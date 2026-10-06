"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { experiments } from "../../features/missions/experiments";
import { setMissionActive } from "../../features/community/profile-data";

export function MissionTree({
  completedMissionIds = [],
  activeMissionIds = [],
  uid,
}: {
  completedMissionIds?: string[];
  activeMissionIds?: string[];
  uid?: string;
}) {
  const [active, setActive] = useState(activeMissionIds);
  const [pending, setPending] = useState<string | null>(null);
  async function toggle(missionId: string) {
    if (!uid) return;
    const isActive = active.includes(missionId);
    setPending(missionId);
    try {
      await setMissionActive(uid, missionId, !isActive);
      setActive(
        isActive ? active.filter((id) => id !== missionId) : [...active, missionId],
      );
    } finally {
      setPending(null);
    }
  }
  return (
    <ol className="mission-tree" aria-label="Árvore de missões">
      {experiments.map((mission, index) => {
        const done = completedMissionIds.includes(mission.slug);
        const inProgress = active.includes(mission.slug);
        const state = done
          ? "CONCLUÍDA"
          : inProgress
            ? "EM ANDAMENTO"
            : index < 2
              ? "ABERTA"
              : "EM ESPERA";
        return (
          <li
            className={
              done
                ? "mission-node done"
                : inProgress
                  ? "mission-node available"
                  : index < 2
                    ? "mission-node available"
                    : "mission-node"
            }
            key={mission.slug}
          >
            <span className="mission-rail" aria-hidden="true" />
            <span className="mission-dot" aria-hidden="true" />
            <article>
              <div>
                <small>commit {mission.number}</small>
                <b>{state}</b>
              </div>
              <h3>{mission.name}</h3>
              <p>{mission.eyebrow}</p>
              <Link href={`/estudos/${mission.slug}`}>
                Abrir missão <span>→</span>
              </Link>
              {uid && !done && (
                <button
                  className="mission-state-button"
                  disabled={pending === mission.slug}
                  onClick={() => toggle(mission.slug)}
                  type="button"
                >
                  {inProgress ? (
                    <>
                      <Pause size={14} />
                      Pausar missão
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Iniciar missão
                    </>
                  )}
                </button>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
