"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  accessCommunity,
  accessErrorMessage,
  leaveCommunity,
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";

const AuthField = dynamic(
  () => import("../visuals/auth-field").then((module) => module.AuthField),
  { ssr: false },
);

export function CommunityAccess() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<CommunityMember | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return observeCommunityMember(setUser);
  }, []);

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "").trim();

    setPending(true);
    setMessage("");
    try {
      await accessCommunity({ mode, email, password, displayName: name });
      setOpen(false);
    } catch (error) {
      setMessage(accessErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  if (!firebaseEnabled) {
    return <span className="community-status">Rede em configuração</span>;
  }

  if (user) {
    return (
      <button className="community-account" type="button" onClick={leaveCommunity}>
        Sair da rede
      </button>
    );
  }

  return (
    <div className="community-access">
      <button
        className="community-access-trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        Entrar
      </button>
      {open && (
        <div
          className="community-dialog-backdrop"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <section
            aria-labelledby="community-access-title"
            aria-modal="true"
            className="community-dialog"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="form-atmosphere" aria-hidden="true">
              <AuthField />
            </div>
            <div className="form-atmosphere-grid" aria-hidden="true" />
            <button
              className="dialog-close"
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="dialog-label">MENTOCYBER / REDE</p>
            <h2 id="community-access-title">
              {mode === "signin" ? "Volte para a conversa." : "Entre para a rede."}
            </h2>
            <p>Use seu e-mail para participar das missões e registrar contribuições.</p>
            <form action={handleSubmit}>
              {mode === "signup" && (
                <label>
                  Como a rede chama você
                  <input name="name" autoComplete="name" placeholder="Seu nome…" />
                </label>
              )}
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com…"
                  required
                />
              </label>
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={6}
                  required
                />
              </label>
              {message && (
                <p className="form-message" aria-live="polite">
                  {message}
                </p>
              )}
              <button className="dialog-submit" disabled={pending} type="submit">
                {pending
                  ? "Conectando…"
                  : mode === "signin"
                    ? "Entrar na rede"
                    : "Criar perfil"}
              </button>
            </form>
            <button
              className="dialog-switch"
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Ainda não participa? Criar perfil"
                : "Já participa? Entrar"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
