"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  leaveCommunity,
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";
import { experiments } from "../../features/missions/experiments";
import {
  getCommunityProfile,
  saveCommunityProfile,
  type CommunityProfile,
} from "../../features/community/profile-data";
import { TagPicker } from "./tag-picker";

const AuthField = dynamic(
  () => import("../visuals/auth-field").then((module) => module.AuthField),
  { ssr: false },
);
const specialtyOptions = [
  "SOC",
  "Resposta a incidentes",
  "Threat hunting",
  "Pentest",
  "AppSec",
  "Cloud security",
  "GRC",
  "Forense",
  "OSINT",
  "Red team",
  "Blue team",
  "Segurança de redes",
];
const stackOptions = [
  "Wireshark",
  "Splunk",
  "Elastic",
  "Wazuh",
  "Burp Suite",
  "Nmap",
  "Kali Linux",
  "Python",
  "PowerShell",
  "SIEM",
  "EDR",
  "Docker",
];
const badgeOptions = [
  "first-signal",
  "first-contribution",
  "field-notes",
  "peer-review",
  "signal-hunter",
  "incident-trace",
];
const listValue = (formData: FormData, name: string, max: number) =>
  Array.from(
    new Set(
      String(formData.get(name) || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, max);

export function ProfileSettings() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          .then(setProfile)
          .catch(() => setMessage("Não foi possível carregar suas configurações."))
          .finally(() => setLoading(false));
      }),
    [],
  );
  async function handleSave(formData: FormData) {
    if (!member || !profile) return;
    setSaving(true);
    setMessage("");
    const next = {
      displayName: String(formData.get("displayName") || "")
        .trim()
        .slice(0, 60),
      handle: String(formData.get("handle") || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 24),
      bio: String(formData.get("bio") || "")
        .trim()
        .slice(0, 320),
      photoURL: String(formData.get("photoURL") || "")
        .trim()
        .slice(0, 2048),
      bannerURL: String(formData.get("bannerURL") || "")
        .trim()
        .slice(0, 2048),
      links: {
        github: String(formData.get("github") || "").trim(),
        linkedin: String(formData.get("linkedin") || "").trim(),
        instagram: String(formData.get("instagram") || "").trim(),
        x: String(formData.get("x") || "").trim(),
        website: String(formData.get("website") || "").trim(),
      },
      specialties: listValue(formData, "specialties", 8),
      stack: listValue(formData, "stack", 12),
      featuredMissionIds: listValue(formData, "featuredMissionIds", 3),
      featuredBadgeIds: listValue(formData, "featuredBadgeIds", 3),
      helpRequest: String(formData.get("helpRequest") || "")
        .trim()
        .slice(0, 240),
      mentorAvailable: formData.get("mentorAvailable") === "on",
      collaborationAvailable: formData.get("collaborationAvailable") === "on",
      profileVisible: formData.get("profileVisible") === "on",
      showSocialLinks: formData.get("showSocialLinks") === "on",
      showActivity: formData.get("showActivity") === "on",
    };
    try {
      await saveCommunityProfile(member.uid, next);
      setProfile({ ...profile, ...next });
      setMessage("Configurações salvas.");
    } catch {
      setMessage("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
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
        <p className="profile-loading">Carregando configurações…</p>
      </main>
    );
  if (!member || !profile)
    return (
      <main className="profile-page profile-gate">
        <p className="auth-eyebrow">CONFIGURAÇÕES</p>
        <h1>Entre para ajustar seu perfil.</h1>
        <Link className="profile-primary" href="/entrar">
          Entrar
        </Link>
      </main>
    );
  return (
    <main className="profile-page settings-page">
      <div className="settings-background" aria-hidden="true">
        <AuthField />
      </div>
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/perfil">Perfil</Link>
          <Link href="/perfil/convites">Convites</Link>
          <Link href="/labs">Labs</Link>
          <button type="button" onClick={() => leaveCommunity()}>
            Sair
          </button>
        </nav>
      </header>
      <section className="settings-heading">
        <Link className="settings-back" href="/perfil">
          <span>←</span> Voltar ao perfil
        </Link>
        <p className="auth-eyebrow">CONFIGURAÇÕES / PERFIL</p>
        <h1>Sua identidade na rede.</h1>
        <p>
          Organize o que é público, como você pratica e quando está disponível. Avatar e
          banner continuam sendo URLs externas.
        </p>
      </section>
      <section className="profile-panel profile-editor">
        <form action={handleSave}>
          <details className="settings-section" open>
            <summary>
              <span>
                <b>01</b> Identidade e prática
              </span>
              <small>Nome, foco e stack</small>
            </summary>
            <div className="settings-form-layout">
              <div className="settings-identity">
                <label>
                  Nome de exibição
                  <input
                    name="displayName"
                    defaultValue={profile.displayName}
                    required
                    maxLength={60}
                  />
                </label>
                <label>
                  Identificador
                  <input
                    name="handle"
                    defaultValue={profile.handle}
                    required
                    maxLength={24}
                  />
                </label>
                <label>
                  Bio
                  <textarea
                    name="bio"
                    defaultValue={profile.bio}
                    maxLength={320}
                    placeholder="O que você está praticando, investigando ou procurando trocar?"
                  />
                </label>
              </div>
              <div className="settings-presence">
                <TagPicker
                  initialValues={profile.specialties}
                  label="Especialidades"
                  name="specialties"
                  options={specialtyOptions}
                  placeholder="Outra especialidade + Enter"
                />
                <TagPicker
                  initialValues={profile.stack}
                  label="Stack"
                  name="stack"
                  options={stackOptions}
                  placeholder="Outra tecnologia + Enter"
                />
              </div>
            </div>
          </details>
          <details className="settings-section">
            <summary>
              <span>
                <b>02</b> Presença e redes
              </span>
              <small>Imagem e links públicos</small>
            </summary>
            <div className="settings-form-layout">
              <div className="settings-media">
                <label>
                  URL da foto
                  <input
                    name="photoURL"
                    type="url"
                    defaultValue={profile.photoURL}
                    placeholder="https://cdn.discordapp.com/..."
                  />
                </label>
                <label>
                  URL do banner
                  <input
                    name="bannerURL"
                    type="url"
                    defaultValue={profile.bannerURL}
                    placeholder="https://cdn.discordapp.com/..."
                  />
                </label>
              </div>
              <div className="social-fields">
                <label>
                  GitHub
                  <input
                    name="github"
                    type="url"
                    defaultValue={profile.links.github}
                    placeholder="https://github.com/..."
                  />
                </label>
                <label>
                  LinkedIn
                  <input
                    name="linkedin"
                    type="url"
                    defaultValue={profile.links.linkedin}
                    placeholder="https://linkedin.com/in/..."
                  />
                </label>
                <label>
                  Instagram
                  <input
                    name="instagram"
                    type="url"
                    defaultValue={profile.links.instagram}
                    placeholder="https://instagram.com/..."
                  />
                </label>
                <label>
                  X
                  <input
                    name="x"
                    type="url"
                    defaultValue={profile.links.x}
                    placeholder="https://x.com/..."
                  />
                </label>
                <label>
                  Site / portfólio
                  <input
                    name="website"
                    type="url"
                    defaultValue={profile.links.website}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </div>
          </details>
          <details className="settings-section">
            <summary>
              <span>
                <b>03</b> Destaques públicos
              </span>
              <small>Até três itens de cada tipo</small>
            </summary>
            <div className="settings-form-layout">
              <div>
                <TagPicker
                  initialValues={profile.featuredMissionIds}
                  label="Missões em destaque"
                  name="featuredMissionIds"
                  options={experiments.map((mission) => mission.slug)}
                  placeholder="Outra missão + Enter"
                />
              </div>
              <div>
                <TagPicker
                  initialValues={profile.featuredBadgeIds}
                  label="Badges em destaque"
                  name="featuredBadgeIds"
                  options={badgeOptions}
                  placeholder="Outro badge + Enter"
                />
              </div>
            </div>
          </details>
          <details className="settings-section">
            <summary>
              <span>
                <b>04</b> Disponibilidade e privacidade
              </span>
              <small>Convites e visibilidade</small>
            </summary>
            <div className="settings-form-layout">
              <label>
                Pedido de ajuda
                <textarea
                  name="helpRequest"
                  defaultValue={profile.helpRequest}
                  maxLength={240}
                  placeholder="Em que tema você busca colaboração?"
                />
              </label>
              <div className="settings-toggles">
                <label>
                  <input
                    defaultChecked={profile.mentorAvailable}
                    name="mentorAvailable"
                    type="checkbox"
                  />
                  <span>Disponível para mentoria</span>
                </label>
                <label>
                  <input
                    defaultChecked={profile.collaborationAvailable}
                    name="collaborationAvailable"
                    type="checkbox"
                  />
                  <span>Disponível para colaborar</span>
                </label>
                <label>
                  <input
                    defaultChecked={profile.profileVisible}
                    name="profileVisible"
                    type="checkbox"
                  />
                  <span>Perfil público</span>
                </label>
                <label>
                  <input
                    defaultChecked={profile.showSocialLinks}
                    name="showSocialLinks"
                    type="checkbox"
                  />
                  <span>Exibir redes</span>
                </label>
                <label>
                  <input
                    defaultChecked={profile.showActivity}
                    name="showActivity"
                    type="checkbox"
                  />
                  <span>Exibir atividade</span>
                </label>
              </div>
            </div>
          </details>
          {message && (
            <p className="form-message" aria-live="polite">
              {message}
            </p>
          )}
          <div className="settings-actions">
            <Link className="profile-secondary" href="/perfil">
              Cancelar
            </Link>
            <button className="profile-primary" type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar configurações"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
