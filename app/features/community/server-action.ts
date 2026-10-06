"use client";

import { auth } from "./firebase";

export async function communityAction<T>(
  action: string,
  payload: Record<string, unknown> = {},
) {
  const user = auth?.currentUser;
  const token = user ? await user.getIdToken() : undefined;
  const response = await fetch("/api/community", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, payload }),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok)
    throw new Error(data.error || "Não foi possível concluir esta operação.");
  return data;
}
