"use client";

import {
  Ban,
  Bookmark,
  Check,
  Flag,
  Handshake,
  MessageCircle,
  Send,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import {
  getCommunityProfile,
  type CommunityProfile,
} from "../../features/community/profile-data";
import {
  isFollowingProfile,
  reportMember,
  saveProfileForLater,
  sendProfileInvite,
  setBlockedMember,
  toggleProfileFollow,
  type InviteKind,
} from "../../features/community/profile-network";

export function ProfileActions({ profile }: { profile: CommunityProfile }) {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [ownProfile, setOwnProfile] = useState<CommunityProfile | null>(null);
  const [kind, setKind] = useState<InviteKind | null>(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [following, setFollowing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (next) {
          getCommunityProfile(next.uid)
            .then((loaded) => {
              setOwnProfile(loaded);
              setBlocked(loaded.blockedUserIds.includes(profile.uid));
            })
            .catch(() => setOwnProfile(null));
          isFollowingProfile(next.uid, profile.uid)
            .then(setFollowing)
            .catch(() => setFollowing(false));
        } else {
          setOwnProfile(null);
          setFollowing(false);
          setBlocked(false);
        }
      }),
    [profile.uid],
  );
  const activeMember = member;
  const activeProfile = ownProfile;
  const availability =
    profile.mentorAvailable || profile.collaborationAvailable ? (
      <div className="public-availability">
        {profile.mentorAvailable && <span>Mentoria aberta</span>}
        {profile.collaborationAvailable && <span>Colaboração aberta</span>}
      </div>
    ) : null;
  if (!activeMember || !activeProfile || activeMember.uid === profile.uid)
    return availability;
  const saved = activeProfile.savedProfileIds.includes(profile.uid);
  async function toggleFollow() {
    const currentMember = activeMember!;
    setPending(true);
    try {
      await toggleProfileFollow(currentMember.uid, profile.uid, following);
      setFollowing(!following);
    } catch {
      setNotice("Não foi possível atualizar o seguimento.");
    } finally {
      setPending(false);
    }
  }
  async function toggleBlock() {
    const currentMember = activeMember!;
    setPending(true);
    try {
      await setBlockedMember(currentMember.uid, profile.uid, blocked);
      setBlocked(!blocked);
      if (!blocked && following) {
        await toggleProfileFollow(currentMember.uid, profile.uid, true);
        setFollowing(false);
      }
      setNotice(
        blocked
          ? "Membro desbloqueado."
          : "Membro bloqueado e removido do seu seguindo.",
      );
    } catch {
      setNotice("Não foi possível atualizar o bloqueio.");
    } finally {
      setPending(false);
    }
  }
  async function report() {
    const currentMember = activeMember!;
    const reason = window.prompt("Descreva o motivo da denúncia (até 400 caracteres):");
    if (!reason?.trim()) return;
    try {
      await reportMember(currentMember.uid, profile.uid, reason.trim());
      setNotice("Denúncia recebida para análise.");
    } catch {
      setNotice("Não foi possível enviar a denúncia.");
    }
  }
  async function toggleSaved() {
    const currentMember = activeMember!;
    const currentProfile = activeProfile!;
    setPending(true);
    try {
      await saveProfileForLater(currentMember.uid, profile.uid, saved);
      setOwnProfile({
        ...currentProfile,
        savedProfileIds: saved
          ? currentProfile.savedProfileIds.filter((id) => id !== profile.uid)
          : [...currentProfile.savedProfileIds, profile.uid],
      });
    } catch {
      setNotice("Não foi possível atualizar seus perfis salvos.");
    } finally {
      setPending(false);
    }
  }
  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    const currentMember = activeMember!;
    const currentProfile = activeProfile!;
    event.preventDefault();
    if (!kind) return;
    setPending(true);
    setNotice("");
    try {
      await sendProfileInvite({
        senderId: currentMember.uid,
        recipientId: profile.uid,
        senderName: currentProfile.displayName,
        senderHandle: currentProfile.handle,
        recipientName: profile.displayName,
        recipientHandle: profile.handle,
        kind,
        message: message.trim().slice(0, 280),
      });
      setNotice("Convite enviado. Você pode acompanhar a resposta em Convites.");
      setKind(null);
      setMessage("");
    } catch {
      setNotice("Não foi possível enviar o convite.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="profile-actions" aria-label="Ações do perfil">
      {availability}
      <div className="profile-action-buttons">
        {!blocked && (
          <>
            <button type="button" disabled={pending} onClick={toggleFollow}>
              {following ? <UserCheck size={15} /> : <UserPlus size={15} />}
              {following ? "Seguindo" : "Seguir"}
            </button>
            <button type="button" disabled={pending} onClick={toggleSaved}>
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
              {saved ? "Perfil salvo" : "Salvar perfil"}
            </button>
            {profile.collaborationAvailable && (
              <button type="button" onClick={() => setKind("collaboration")}>
                <Handshake size={15} />
                Convidar para colaborar
              </button>
            )}
            {profile.mentorAvailable && (
              <button type="button" onClick={() => setKind("mentorship")}>
                <MessageCircle size={15} />
                Pedir mentoria
              </button>
            )}
          </>
        )}
        <button
          className="profile-action-muted"
          disabled={pending}
          onClick={toggleBlock}
          type="button"
        >
          <Ban size={15} />
          {blocked ? "Desbloquear" : "Bloquear"}
        </button>
        <button className="profile-action-muted" onClick={report} type="button">
          <Flag size={15} />
          Denunciar
        </button>
      </div>
      {kind && (
        <form className="invite-composer" onSubmit={submitInvite}>
          <div>
            <p className="auth-eyebrow">
              {kind === "mentorship" ? "PEDIDO DE MENTORIA" : "CONVITE DE COLABORAÇÃO"}
            </p>
            <button
              aria-label="Fechar formulário"
              onClick={() => setKind(null)}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            autoFocus
            maxLength={280}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Contextualize o convite em poucas linhas (opcional)."
            value={message}
          />
          <button className="profile-primary" disabled={pending} type="submit">
            <Send size={15} />
            Enviar convite
          </button>
        </form>
      )}
      {notice && (
        <p className="profile-action-notice" aria-live="polite">
          <Check size={15} />
          {notice}
        </p>
      )}
    </section>
  );
}
