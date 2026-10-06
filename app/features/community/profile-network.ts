"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { profileFromData, type CommunityProfile } from "./profile-data";
import { db } from "./firebase";
import { communityAction } from "./server-action";

export type InviteKind = "collaboration" | "mentorship";
export type ProfileInvite = {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderHandle: string;
  recipientName: string;
  recipientHandle: string;
  kind: InviteKind;
  message: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
};

export type ProfileFollow = { id: string; followerId: string; followingId: string };
const followId = (followerId: string, followingId: string) =>
  `${followerId}_${followingId}`;

export async function isFollowingProfile(followerId: string, followingId: string) {
  if (!db) return false;
  return (
    await getDoc(doc(db, "profileFollows", followId(followerId, followingId)))
  ).exists();
}

export async function toggleProfileFollow(
  followerId: string,
  followingId: string,
  following: boolean,
) {
  void followerId;
  await communityAction("network.follow", {
    targetId: followingId,
    enabled: !following,
  });
}

export async function listProfileFollows(
  uid: string,
  direction: "followers" | "following",
) {
  if (!db) throw new Error("Firebase indisponível");
  const field = direction === "followers" ? "followingId" : "followerId";
  const snapshot = await getDocs(
    query(collection(db, "profileFollows"), where(field, "==", uid), limit(60)),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as ProfileFollow,
  );
}

export async function getProfilesByIds(ids: string[]) {
  const firestore = db;
  if (!firestore) return [] as CommunityProfile[];
  const profiles = await Promise.all(
    ids.slice(0, 30).map(async (id) => {
      const snapshot = await getDoc(doc(firestore, "memberProfiles", id));
      return snapshot.exists() ? profileFromData(id, snapshot.data()) : null;
    }),
  );
  return profiles.filter(
    (profile): profile is CommunityProfile =>
      profile !== null && profile.profileVisible,
  );
}

export async function listDiscoverableProfiles() {
  if (!db) return [] as CommunityProfile[];
  const snapshot = await getDocs(query(collection(db, "memberProfiles"), limit(60)));
  return snapshot.docs
    .map((item) => profileFromData(item.id, item.data()))
    .filter((profile) => profile.profileVisible)
    .sort((a, b) => b.contributionCount - a.contributionCount);
}

export async function saveProfileForLater(
  uid: string,
  profileId: string,
  saved: boolean,
) {
  void uid;
  await communityAction("network.save", { targetId: profileId, enabled: !saved });
}

export async function setBlockedMember(
  uid: string,
  targetId: string,
  blocked: boolean,
) {
  void uid;
  await communityAction("network.block", { targetId, enabled: !blocked });
}

export async function reportMember(authorId: string, targetId: string, reason: string) {
  void authorId;
  await communityAction("network.report", { targetId, reason });
}

export async function sendProfileInvite(invite: Omit<ProfileInvite, "id" | "status">) {
  await communityAction("invite.send", {
    targetId: invite.recipientId,
    kind: invite.kind,
    message: invite.message,
  });
}

export async function listProfileInvites(uid: string, direction: "received" | "sent") {
  if (!db) throw new Error("Firebase indisponível");
  const field = direction === "received" ? "recipientId" : "senderId";
  const snapshot = await getDocs(
    query(collection(db, "profileInvites"), where(field, "==", uid), limit(30)),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as ProfileInvite,
  );
}

export async function setInviteStatus(id: string, status: ProfileInvite["status"]) {
  await communityAction("invite.status", { id, status });
}
