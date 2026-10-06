import {
  Award,
  BadgeCheck,
  BookOpen,
  Bug,
  CalendarDays,
  Crown,
  Handshake,
  Megaphone,
  Mic2,
  Network,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export const profileTagCatalog = {
  team: { label: "Equipe", icon: UsersRound },
  partner: { label: "Parceiro", icon: Handshake },
  influencer: { label: "Influencer", icon: Megaphone },
  bug_hunter: { label: "Bug Hunter", icon: Bug },
  mentor: { label: "Mentor", icon: Network },
  ambassador: { label: "Embaixador", icon: Network },
  researcher: { label: "Pesquisador", icon: BookOpen },
  organizer: { label: "Organizador", icon: UsersRound },
  speaker: { label: "Palestrante", icon: Mic2 },
  author: { label: "Autor", icon: BookOpen },
  verified: { label: "Verificado", icon: ShieldCheck },
  founder: { label: "Fundador", icon: Crown },
  recurring_contributor: { label: "Colaborador recorrente", icon: Award },
  verified_creator: { label: "Conteúdo verificado", icon: ShieldCheck },
  partner_lab: { label: "Laboratório parceiro", icon: Network },
  official_event: { label: "Evento oficial", icon: CalendarDays },
  guest_expert: { label: "Especialista convidado", icon: Award },
} as const;

export type ProfileTagId = keyof typeof profileTagCatalog;

export function NameVerification({ tags }: { tags: string[] }) {
  const kind = tags.includes("partner")
    ? "partner"
    : tags.includes("influencer")
      ? "influencer"
      : tags.includes("bug_hunter")
        ? "bug_hunter"
        : tags.includes("verified")
          ? "verified"
          : null;
  if (!kind) return null;
  const label =
    kind === "verified"
      ? "Perfil verificado"
      : kind === "influencer"
        ? "Influenciador verificado"
        : kind === "bug_hunter"
          ? "Bug Hunter"
          : "Parceiro oficial";
  const Icon =
    kind === "bug_hunter" ? Bug : kind === "partner" ? Handshake : BadgeCheck;
  return (
    <span
      className={`name-verification name-verification-${kind}`}
      aria-label={label}
      title={label}
    >
      <Icon aria-hidden="true" size={24} strokeWidth={2.5} />
    </span>
  );
}

export function ProfileTags({ tags }: { tags: string[] }) {
  const valid = tags.filter((tag): tag is ProfileTagId => tag in profileTagCatalog);
  if (!valid.length) return null;
  return (
    <div className="profile-tags" aria-label="Tags do perfil">
      {valid.map((tag) => {
        const item = profileTagCatalog[tag];
        const Icon = item.icon;
        return (
          <span className={`profile-tag tag-${tag}`} key={tag}>
            <Icon aria-hidden="true" size={13} strokeWidth={2} />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
