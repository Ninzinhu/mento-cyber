"use client";

import {
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db } from "./firebase";
import { communityAction } from "./server-action";

export type ProfileLinks = {
  github: string;
  linkedin: string;
  instagram: string;
  x: string;
  website: string;
};

export type CommunityProfile = {
  uid: string;
  displayName: string;
  email?: string;
  handle: string;
  bio: string;
  photoURL: string;
  bannerURL: string;
  links: ProfileLinks;
  badgeIds: string[];
  completedMissionIds: string[];
  completedLabIds: string[];
  favoriteMissionIds: string[];
  activeMissionIds: string[];
  featuredMissionIds: string[];
  featuredBadgeIds: string[];
  savedProfileIds: string[];
  blockedUserIds: string[];
  recentMissionIds: string[];
  systemTags: string[];
  specialties: string[];
  stack: string[];
  helpRequest: string;
  mentorAvailable: boolean;
  collaborationAvailable: boolean;
  profileVisible: boolean;
  showSocialLinks: boolean;
  showActivity: boolean;
  contributionCount: number;
  reviewCount: number;
  xp: number;
  role: "member" | "moderator" | "admin";
};

const emptyLinks: ProfileLinks = {
  github: "",
  linkedin: "",
  instagram: "",
  x: "",
  website: "",
};

function stringList(value: unknown) {
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" && value.trim() ? [value.trim()] : [];
}

export function profileFromData(
  uid: string,
  data?: Record<string, unknown>,
): CommunityProfile {
  const links =
    typeof data?.links === "object" && data.links
      ? (data.links as Partial<ProfileLinks>)
      : {};
  return {
    uid,
    displayName: String(data?.displayName || "Membro da rede"),
    email: typeof data?.email === "string" ? data.email : undefined,
    handle: String(data?.handle || "membro"),
    bio: String(data?.bio || ""),
    photoURL: String(data?.photoURL || ""),
    bannerURL: String(data?.bannerURL || ""),
    links: { ...emptyLinks, ...links },
    badgeIds: stringList(data?.badgeIds),
    completedMissionIds: stringList(data?.completedMissionIds),
    completedLabIds: stringList(data?.completedLabIds),
    favoriteMissionIds: stringList(data?.favoriteMissionIds),
    activeMissionIds: stringList(data?.activeMissionIds),
    featuredMissionIds: stringList(data?.featuredMissionIds),
    featuredBadgeIds: stringList(data?.featuredBadgeIds),
    savedProfileIds: stringList(data?.savedProfileIds),
    blockedUserIds: stringList(data?.blockedUserIds),
    recentMissionIds: stringList(data?.recentMissionIds),
    systemTags: stringList(data?.systemTags),
    specialties: stringList(data?.specialties),
    stack: stringList(data?.stack),
    helpRequest: String(data?.helpRequest || ""),
    mentorAvailable: data?.mentorAvailable === true,
    collaborationAvailable: data?.collaborationAvailable === true,
    profileVisible: data?.profileVisible !== false,
    showSocialLinks: data?.showSocialLinks !== false,
    showActivity: data?.showActivity !== false,
    contributionCount:
      typeof data?.contributionCount === "number" ? data.contributionCount : 0,
    reviewCount: typeof data?.reviewCount === "number" ? data.reviewCount : 0,
    xp: typeof data?.xp === "number" ? data.xp : 0,
    role: data?.role === "moderator" || data?.role === "admin" ? data.role : "member",
  };
}

export async function getCommunityProfile(uid: string) {
  if (!db) throw new Error("Firebase indisponível");
  const snapshot = await getDoc(doc(db, "profiles", uid));
  return profileFromData(uid, snapshot.data());
}

export function publicProfileData(
  profile: Pick<
    CommunityProfile,
    | "uid"
    | "displayName"
    | "handle"
    | "bio"
    | "photoURL"
    | "bannerURL"
    | "links"
    | "badgeIds"
    | "completedMissionIds"
    | "completedLabIds"
    | "featuredMissionIds"
    | "featuredBadgeIds"
    | "recentMissionIds"
    | "contributionCount"
    | "reviewCount"
    | "xp"
    | "systemTags"
    | "specialties"
    | "stack"
    | "helpRequest"
    | "mentorAvailable"
    | "collaborationAvailable"
    | "profileVisible"
    | "showSocialLinks"
    | "showActivity"
  >,
) {
  return {
    uid: profile.uid,
    displayName: profile.displayName,
    handle: profile.handle,
    bio: profile.bio,
    photoURL: profile.photoURL,
    bannerURL: profile.bannerURL,
    links: profile.links,
    badgeIds: profile.badgeIds,
    completedMissionIds: profile.completedMissionIds,
    completedLabIds: profile.completedLabIds,
    featuredMissionIds: profile.featuredMissionIds,
    featuredBadgeIds: profile.featuredBadgeIds,
    recentMissionIds: profile.recentMissionIds,
    contributionCount: profile.contributionCount,
    reviewCount: profile.reviewCount,
    xp: profile.xp,
    systemTags: profile.systemTags,
    specialties: profile.specialties,
    stack: profile.stack,
    helpRequest: profile.helpRequest,
    mentorAvailable: profile.mentorAvailable,
    collaborationAvailable: profile.collaborationAvailable,
    profileVisible: profile.profileVisible,
    showSocialLinks: profile.showSocialLinks,
    showActivity: profile.showActivity,
  };
}

export async function saveCommunityProfile(
  uid: string,
  profile: Pick<
    CommunityProfile,
    | "displayName"
    | "handle"
    | "bio"
    | "photoURL"
    | "bannerURL"
    | "links"
    | "featuredMissionIds"
    | "featuredBadgeIds"
    | "specialties"
    | "stack"
    | "helpRequest"
    | "mentorAvailable"
    | "collaborationAvailable"
    | "profileVisible"
    | "showSocialLinks"
    | "showActivity"
  >,
) {
  await communityAction("profile.update", { profile });
}

export async function syncPublicProfile(profile: CommunityProfile) {
  void profile;
  throw new Error("A sincronização pública é feita exclusivamente pelo servidor.");
}

export async function updateFavoriteMissions(
  uid: string,
  missionId: string,
  active: boolean,
) {
  void uid;
  await communityAction("mission.favorite", { missionId, active });
}

export async function setMissionActive(
  uid: string,
  missionId: string,
  active: boolean,
) {
  void uid;
  await communityAction("mission.activity", { missionId, active });
}

export async function getPublicProfileByHandle(handle: string) {
  if (!db) throw new Error("Firebase indisponível");
  const snapshot = await getDocs(
    query(collection(db, "memberProfiles"), where("handle", "==", handle), limit(1)),
  );
  if (snapshot.empty) return null;
  const item = snapshot.docs[0];
  return profileFromData(item.id, item.data());
}
