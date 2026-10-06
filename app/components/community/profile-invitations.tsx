"use client";

import Link from "next/link";
import { Check, Clock3, Handshake, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  leaveCommunity,
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";
import {
  listProfileInvites,
  setInviteStatus,
  type ProfileInvite,
} from "../../features/community/profile-network";

function InviteCard({
  item,
  incoming = false,
  onUpdate,
}: {
  item: ProfileInvite;
  incoming?: boolean;
  onUpdate: (id: string, status: ProfileInvite["status"]) => void;
}) {
  const counterpart = incoming ? item.senderName : item.recipientName;
  const handle = incoming ? item.senderHandle : item.recipientHandle;
  return (
    <article className="invite-card">
      <div className="invite-card-top">
        <span className={`invite-kind ${item.kind}`}>
          {item.kind === "mentorship" ? (
            <MessageCircle size={15} />
          ) : (
            <Handshake size={15} />
          )}
          {item.kind === "mentorship" ? "Mentoria" : "Colaboração"}
        </span>
        <span className={`invite-status ${item.status}`}>
          {item.status === "pending" ? (
            <Clock3 size={14} />
          ) : item.status === "accepted" ? (
            <Check size={14} />
          ) : (
            <X size={14} />
          )}
          {item.status === "pending"
            ? "Pendente"
            : item.status === "accepted"
              ? "Aceito"
              : item.status === "declined"
                ? "Recusado"
                : "Cancelado"}
        </span>
      </div>
      <strong>{counterpart}</strong>
      <Link href={`/perfil/${handle}`}>@{handle}</Link>
      {item.message && <p>{item.message}</p>}
      {item.status === "pending" && (
        <div className="invite-card-actions">
          {incoming ? (
            <>
              <button onClick={() => onUpdate(item.id, "accepted")} type="button">
                Aceitar
              </button>
              <button onClick={() => onUpdate(item.id, "declined")} type="button">
                Recusar
              </button>
            </>
          ) : (
            <button onClick={() => onUpdate(item.id, "cancelled")} type="button">
              Cancelar convite
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export function ProfileInvitations() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [received, setReceived] = useState<ProfileInvite[]>([]);
  const [sent, setSent] = useState<ProfileInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (!next) {
          setLoading(false);
          return;
        }
        Promise.all([
          listProfileInvites(next.uid, "received"),
          listProfileInvites(next.uid, "sent"),
        ])
          .then(([nextReceived, nextSent]) => {
            setReceived(nextReceived);
            setSent(nextSent);
          })
          .catch(() => setMessage("Não foi possível carregar seus convites."))
          .finally(() => setLoading(false));
      }),
    [],
  );
  async function update(id: string, status: ProfileInvite["status"]) {
    try {
      await setInviteStatus(id, status);
      setReceived((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      setSent((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch {
      setMessage("Não foi possível atualizar o convite.");
    }
  }
  if (!firebaseEnabled)
    return (
      <main className="profile-page">
        <p>Firebase ainda não está configurado neste ambiente.</p>
      </main>
    );
  if (loading)
    return (
      <main className="profile-page">
        <p className="profile-loading">Carregando convites…</p>
      </main>
    );
  if (!member)
    return (
      <main className="profile-page profile-gate">
        <p className="auth-eyebrow">CONVITES</p>
        <h1>Entre para conversar com a rede.</h1>
        <Link className="profile-primary" href="/entrar">
          Entrar
        </Link>
      </main>
    );
  return (
    <main className="profile-page invitations-page">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/perfil">Perfil</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/perfil/configuracoes">Configurações</Link>
          <button onClick={() => leaveCommunity()} type="button">
            Sair
          </button>
        </nav>
      </header>
      <section className="invitations-intro">
        <p className="auth-eyebrow">REDE / CONVITES</p>
        <h1>Conversas que começam pela prática.</h1>
        <p>Responda aos convites de colaboração e mentoria sem expor seu e-mail.</p>
      </section>
      {message && <p className="form-message">{message}</p>}
      <div className="invitations-grid">
        <section className="profile-panel">
          <p className="auth-eyebrow">RECEBIDOS</p>
          <h2>Para você</h2>
          <div className="invite-list">
            {received.length ? (
              received.map((item) => (
                <InviteCard incoming item={item} key={item.id} onUpdate={update} />
              ))
            ) : (
              <p className="invite-empty">Nenhum convite recebido ainda.</p>
            )}
          </div>
        </section>
        <section className="profile-panel">
          <p className="auth-eyebrow">ENVIADOS</p>
          <h2>Acompanhamento</h2>
          <div className="invite-list">
            {sent.length ? (
              sent.map((item) => (
                <InviteCard item={item} key={item.id} onUpdate={update} />
              ))
            ) : (
              <p className="invite-empty">
                Explore perfis públicos para iniciar uma conversa.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
