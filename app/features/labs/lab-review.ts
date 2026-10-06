"use client";

import { communityAction } from "../community/server-action";

export type LabReviewItem = {
  id: string;
  labId: string;
  labTitle: string;
  objective: string;
  content: string;
};

export async function getLabReviewQueue() {
  const result = await communityAction<{ items: LabReviewItem[] }>("lab.review.queue");
  return result.items;
}

export async function submitLabReview(
  evidenceId: string,
  decision: "accepted" | "adjust",
  feedback: string,
) {
  await communityAction("lab.review.submit", { evidenceId, decision, feedback });
}
