import Link from "next/link";
import type { CommunityProfile } from "../../features/community/profile-data";

export function ProfileOnboarding({ profile }: { profile: CommunityProfile }) {
  const steps = [
    {
      label: "Apresentar sua prática",
      done: Boolean(profile.bio.trim()),
      href: "/perfil/configuracoes",
    },
    {
      label: "Definir especialidades",
      done: profile.specialties.length > 0,
      href: "/perfil/configuracoes",
    },
    {
      label: "Iniciar uma missão",
      done:
        profile.activeMissionIds.length > 0 || profile.completedMissionIds.length > 0,
      href: "/labs",
    },
    {
      label: "Registrar primeira evidência",
      done: profile.contributionCount > 0,
      href: "/labs",
    },
  ];
  const done = steps.filter((step) => step.done).length;
  if (done === steps.length) return null;
  return (
    <section className="profile-panel onboarding-panel">
      <div>
        <p className="auth-eyebrow">PRÓXIMOS PASSOS</p>
        <h2>{done}/4 sinais de presença configurados</h2>
        <p>
          Uma presença útil na rede começa por contexto e prática, não por preencher
          tudo de uma vez.
        </p>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li className={step.done ? "done" : ""} key={step.label}>
            <span>{step.done ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <b>{step.label}</b>
            {!step.done && <Link href={step.href}>Abrir →</Link>}
          </li>
        ))}
      </ol>
    </section>
  );
}
