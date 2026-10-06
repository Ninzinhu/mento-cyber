"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  accessCommunity,
  accessErrorMessage,
  type AccessMode,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";

const AuthField = dynamic(
  () => import("../visuals/auth-field").then((module) => module.AuthField),
  { ssr: false },
);

export function AuthScreen({ mode }: { mode: AccessMode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const isRegistration = mode === "signup";
  async function submit(formData: FormData) {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const displayName = String(formData.get("displayName") || "").trim();
    setPending(true);
    setMessage("");
    try {
      await accessCommunity({ mode, email, password, displayName });
      router.push("/perfil");
    } catch (error) {
      setMessage(accessErrorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <Link className="auth-route" href={isRegistration ? "/entrar" : "/registro"}>
          {isRegistration ? "Já tenho acesso" : "Criar perfil"}
          <span>↗</span>
        </Link>
      </header>
      <div className="auth-shell">
        <section className="auth-card" aria-labelledby="auth-title">
          <p className="auth-eyebrow">ACESSO À COMUNIDADE</p>
          <h1 id="auth-title">
            {isRegistration ? "Crie sua presença na rede." : "Continue sua prática."}
          </h1>
          <p>
            {isRegistration
              ? "Um perfil para registrar suas missões, evidências e contribuições."
              : "Entre para retomar seus labs, missões e conversas."}
          </p>
          {!firebaseEnabled ? (
            <p className="form-message">
              A conexão da comunidade ainda está sendo configurada.
            </p>
          ) : (
            <form action={submit} className="auth-form">
              {isRegistration && (
                <label>
                  Nome de exibição
                  <input
                    name="displayName"
                    autoComplete="name"
                    required
                    placeholder="Como a rede chama você"
                  />
                </label>
              )}
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="voce@exemplo.com"
                />
              </label>
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  autoComplete={isRegistration ? "new-password" : "current-password"}
                  minLength={6}
                  required
                  placeholder="Mínimo de 6 caracteres"
                />
              </label>
              {message && (
                <p className="form-message" aria-live="polite">
                  {message}
                </p>
              )}
              <button type="submit" disabled={pending}>
                {pending
                  ? "Conectando…"
                  : isRegistration
                    ? "Criar meu perfil"
                    : "Entrar na comunidade"}
              </button>
            </form>
          )}
          <p className="auth-switch">
            {isRegistration ? "Já participa?" : "Ainda não participa?"}{" "}
            <Link href={isRegistration ? "/entrar" : "/registro"}>
              {isRegistration ? "Entrar" : "Criar perfil"}
            </Link>
          </p>
        </section>
        <aside className="auth-scene" aria-label="Sinais da comunidade">
          <div className="auth-scene-canvas">
            <AuthField />
          </div>
          <div className="auth-scene-grid" aria-hidden="true" />
          <div className="auth-scene-label">
            <span>REDE / ATIVA</span>
            <i />
          </div>
          <div className="auth-scene-copy">
            <p>MENTOCYBER / CAMPO DE PRÁTICA</p>
            <strong>
              {isRegistration
                ? "Seu perfil é um ponto de partida."
                : "Sua próxima investigação está aberta."}
            </strong>
            <span>
              Missões, labs e revisão entre pares. Sem feed vazio, sem catálogo de
              curso.
            </span>
          </div>
          <dl className="auth-scene-data">
            <div>
              <dt>MISSÕES</dt>
              <dd>10</dd>
            </div>
            <div>
              <dt>FORMATO</dt>
              <dd>PRÁTICA</dd>
            </div>
            <div>
              <dt>ACESSO</dt>
              <dd>MEMBROS</dd>
            </div>
          </dl>
        </aside>
      </div>
      <p className="auth-footnote">
        Sem catálogo de cursos. Apenas prática, registro e troca entre pares.
      </p>
    </main>
  );
}
