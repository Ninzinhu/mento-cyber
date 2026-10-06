"use client";

import { useState } from "react";
import { registerInterest } from "../../features/community/community-data";

export function InterestForm() {
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  async function submit(formData: FormData) {
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    try {
      await registerInterest(email);
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <form className="interest-form" action={submit}>
      <label>
        Seu e-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com…"
          required
        />
      </label>
      <button className="action" type="submit">
        Acompanhar a rede
      </button>
      {state === "success" && (
        <p aria-live="polite">Pronto. Você está na lista da rede.</p>
      )}
      {state === "error" && (
        <p aria-live="polite">
          Ainda não conectamos este formulário. Tente novamente em breve.
        </p>
      )}
    </form>
  );
}
