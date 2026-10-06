"use client";

import { useEffect, useState } from "react";
import {
  observeCommunityMember,
  submitContribution,
  type CommunityMember,
} from "../../features/community/community-data";
import { firebaseEnabled } from "../../features/community/firebase";

export function ContributionForm({ missionId }: { missionId: string }) {
  const [user, setUser] = useState<CommunityMember | null>(null);
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    return observeCommunityMember(setUser);
  }, []);

  async function submit(formData: FormData) {
    if (!user) return;
    const content = String(formData.get("content") || "").trim();
    try {
      await submitContribution({ missionId, content });
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (!firebaseEnabled) {
    return (
      <p className="contribution-note">
        A conexão com a rede será aberta na homologação.
      </p>
    );
  }
  if (!user) {
    return (
      <p className="contribution-note">
        Entre na rede pelo menu para compartilhar sua leitura.
      </p>
    );
  }
  return (
    <form className="contribution-form" action={submit}>
      <label htmlFor={`contribution-${missionId}`}>Sua hipótese ou evidência</label>
      <textarea
        id={`contribution-${missionId}`}
        name="content"
        minLength={20}
        maxLength={1200}
        placeholder="O que você observou, por que isso importa e que pergunta deixaria para os pares?…"
        required
      />
      <button type="submit">Enviar para revisão</button>
      {state === "success" && (
        <p aria-live="polite">Contribuição recebida para revisão.</p>
      )}
      {state === "error" && (
        <p aria-live="polite">Não foi possível enviar agora. Tente novamente.</p>
      )}
    </form>
  );
}
