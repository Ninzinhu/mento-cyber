"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listDiscoverableProfiles } from "../../features/community/profile-network";
import type { CommunityProfile } from "../../features/community/profile-data";

export function MemberDirectory() {
  const [profiles, setProfiles] = useState<CommunityProfile[]>([]);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("Todos");
  const [availability, setAvailability] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(12);
  useEffect(() => {
    listDiscoverableProfiles()
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);
  const specialties = [
    "Todos",
    ...Array.from(new Set(profiles.flatMap((profile) => profile.specialties))).sort(),
  ];
  const visible = useMemo(
    () =>
      profiles.filter((profile) => {
        const text =
          `${profile.displayName} ${profile.handle} ${profile.bio} ${profile.specialties.join(" ")} ${profile.stack.join(" ")}`.toLowerCase();
        const specialtyMatches =
          specialty === "Todos" || profile.specialties.includes(specialty);
        const availabilityMatches =
          availability === "Todos" ||
          (availability === "Mentoria" && profile.mentorAvailable) ||
          (availability === "Colaboração" && profile.collaborationAvailable);
        return (
          text.includes(query.trim().toLowerCase()) &&
          specialtyMatches &&
          availabilityMatches
        );
      }),
    [profiles, query, specialty, availability],
  );
  const shown = visible.slice(0, visibleCount);
  const resetPage = () => setVisibleCount(12);
  return (
    <main className="profile-page directory-page">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/perfil">Perfil</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/perfil/conexoes">Conexões</Link>
        </nav>
      </header>
      <section className="invitations-intro">
        <p className="auth-eyebrow">COMUNIDADE / MEMBROS</p>
        <h1>Encontre pessoas pela prática.</h1>
        <p>
          Busque repertório, não currículo. Filtre por contexto técnico e
          disponibilidade para troca.
        </p>
      </section>
      <section className="directory-tools">
        <label>
          <Search size={16} />
          <input
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Buscar nome, especialidade ou ferramenta"
            value={query}
          />
        </label>
        <select
          onChange={(event) => {
            setSpecialty(event.target.value);
            resetPage();
          }}
          value={specialty}
        >
          {specialties.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          onChange={(event) => {
            setAvailability(event.target.value);
            resetPage();
          }}
          value={availability}
        >
          <option>Todos</option>
          <option>Mentoria</option>
          <option>Colaboração</option>
        </select>
      </section>
      <p className="directory-count">
        {visible.length} membro{visible.length === 1 ? "" : "s"} encontrado
        {visible.length === 1 ? "" : "s"}
      </p>
      <section className="member-grid">
        {shown.map((profile) => (
          <Link
            className="member-card"
            href={`/perfil/${profile.handle}`}
            key={profile.uid}
          >
            <span className="member-avatar">
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
            <p>{profile.bio || "Praticante da comunidade."}</p>
            <div className="member-tags">
              {profile.specialties.slice(0, 3).map((item) => (
                <i key={item}>{item}</i>
              ))}
            </div>
            <footer>
              {profile.mentorAvailable && <span>Mentoria</span>}
              {profile.collaborationAvailable && <span>Colaboração</span>}
              <em>{profile.contributionCount} registros</em>
            </footer>
          </Link>
        ))}
      </section>
      {visible.length > shown.length && (
        <button
          className="directory-more"
          onClick={() => setVisibleCount((count) => count + 12)}
          type="button"
        >
          Mostrar mais membros
        </button>
      )}
      {!visible.length && (
        <div className="directory-empty">
          Nenhum perfil corresponde aos filtros atuais.
        </div>
      )}
    </main>
  );
}
