"use client";

import Link from "next/link";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../features/community/firebase";

type Contribution = {
  id: string;
  missionId: string;
  content: string;
  status: string;
  reviewNote?: string;
  createdAt?: Timestamp;
};

export function ContributionHistory({ uid }: { uid: string }) {
  const [items, setItems] = useState<Contribution[]>([]);
  useEffect(() => {
    if (db)
      getDocs(
        query(
          collection(db, "contributions"),
          where("authorId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(5),
        ),
      )
        .then((snapshot) =>
          setItems(
            snapshot.docs.map(
              (item) => ({ id: item.id, ...item.data() }) as Contribution,
            ),
          ),
        )
        .catch(() => setItems([]));
  }, [uid]);
  return (
    <section className="profile-panel contribution-history">
      <div className="profile-panel-heading">
        <p className="auth-eyebrow">HISTÓRICO</p>
        <h2>Registros e revisões</h2>
      </div>
      {items.length ? (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <span>{item.status === "approved" ? "REVISADA" : "EM REVISÃO"}</span>
                <Link href={`/estudos/${item.missionId}`}>{item.missionId}</Link>
              </div>
              <p>{item.content}</p>
              {item.reviewNote && <small>Revisão: {item.reviewNote}</small>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="history-empty">
          <p>Ainda não há registros enviados.</p>
          <Link href="/labs">
            Escolher uma missão <span>→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
