import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de servidor ausente: ${name}`);
  return value;
}

function adminApp() {
  if (getApps().length) return getApps()[0]!;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    required("FIREBASE_PROJECT_ID");
  const emulatorEnabled = Boolean(
    process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST,
  );

  if (emulatorEnabled) return initializeApp({ projectId });

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: required("FIREBASE_CLIENT_EMAIL"),
      privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
