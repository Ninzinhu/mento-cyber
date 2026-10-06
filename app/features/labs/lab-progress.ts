"use client";

import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../community/firebase";
import { communityAction } from "../community/server-action";

export type LabProgressStatus = "active" | "submitted" | "reviewed" | "completed";
export type LabProgress = {
  id: string;
  labId: string;
  status: LabProgressStatus;
  evidenceCount: number;
  completedSteps: string[];
  simulationActions: string[];
};

export async function getLabProgress(uid: string) {
  if (!db) return [] as LabProgress[];
  const snapshot = await getDocs(
    query(collection(db, "labProgress"), where("uid", "==", uid), limit(50)),
  );
  return snapshot.docs.map(
    (item): LabProgress => ({
      id: item.id,
      labId: String(item.data().labId || ""),
      status:
        item.data().status === "completed"
          ? "completed"
          : item.data().status === "reviewed"
            ? "reviewed"
            : item.data().status === "submitted"
              ? "submitted"
              : "active",
      evidenceCount: Number(item.data().evidenceCount || 0),
      completedSteps: Array.isArray(item.data().completedSteps)
        ? item
            .data()
            .completedSteps.filter(
              (step: unknown): step is string => typeof step === "string",
            )
        : [],
      simulationActions: Array.isArray(item.data().simulationActions)
        ? item
            .data()
            .simulationActions.filter(
              (action: unknown): action is string => typeof action === "string",
            )
        : [],
    }),
  );
}
export async function startLab(labId: string) {
  await communityAction("lab.start", { labId });
}
export async function submitLabEvidence(labId: string, content: string) {
  await communityAction("lab.evidence.submit", { labId, content });
}
export async function saveLabChecklist(labId: string, completedSteps: string[]) {
  await communityAction("lab.checklist.update", { labId, completedSteps });
}
export async function recordLabSimulationAction(labId: string, actionId: string) {
  await communityAction("lab.simulation.action", { labId, actionId });
}
export async function completeLab(labId: string) {
  return communityAction<{ xp: number }>("lab.complete", { labId });
}
