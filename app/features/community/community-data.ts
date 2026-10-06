"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";
import { communityAction } from "./server-action";

export type CommunityMember = Pick<User, "uid" | "email">;
export type AccessMode = "signin" | "signup";

export function accessErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "auth/email-already-in-use")
    return "Este e-mail já possui um perfil local. Entre na comunidade.";
  if (code === "auth/invalid-email") return "Informe um e-mail válido.";
  if (code === "auth/weak-password") return "Use uma senha com ao menos 6 caracteres.";
  if (code === "auth/invalid-credential" || code === "auth/user-not-found")
    return "E-mail ou senha não correspondem a uma conta local.";
  if (code === "auth/network-request-failed")
    return "Não foi possível alcançar o Auth Emulator em 127.0.0.1:9099.";
  if (error instanceof Error && error.message) return error.message;
  return "Não foi possível concluir agora. Confira os dados e tente novamente.";
}

export function observeCommunityMember(
  callback: (member: CommunityMember | null) => void,
) {
  if (!auth) return () => undefined;
  return onAuthStateChanged(auth, callback);
}

export async function accessCommunity({
  mode,
  email,
  password,
  displayName,
}: {
  mode: AccessMode;
  email: string;
  password: string;
  displayName?: string;
}) {
  if (!auth) throw new Error("Firebase indisponível");
  const credential =
    mode === "signup"
      ? await createUserWithEmailAndPassword(auth, email, password)
      : await signInWithEmailAndPassword(auth, email, password);

  await communityAction("profile.bootstrap", {
    displayName: displayName || email.split("@")[0],
  });
  return credential.user;
}

export async function leaveCommunity() {
  if (!auth) return;
  await signOut(auth);
}

export async function registerInterest(email: string) {
  if (!firebaseEnabled) throw new Error("Firebase indisponível");
  await communityAction("interest.register", { email });
}

export async function submitContribution({
  missionId,
  content,
}: {
  missionId: string;
  content: string;
}) {
  await communityAction("contribution.submit", { missionId, content });
}
