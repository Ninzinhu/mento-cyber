import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../lib/firebase-admin";
import { getLabById, labSimulation } from "../../features/labs/catalog";
import { validatesLabChallenge } from "../../features/labs/lab-challenge";
import { contentTags } from "../../features/content/content-model";
import { targetLanguage, translateNewsMetadata } from "../../lib/content-translation";
import { practiceTracks } from "../../features/operations/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Links = {
  github?: string;
  linkedin?: string;
  instagram?: string;
  x?: string;
  website?: string;
};
type ProfileData = Record<string, unknown>;

const publicFields = [
  "uid",
  "displayName",
  "handle",
  "bio",
  "photoURL",
  "bannerURL",
  "links",
  "badgeIds",
  "completedMissionIds",
  "completedLabIds",
  "featuredMissionIds",
  "featuredBadgeIds",
  "recentMissionIds",
  "contributionCount",
  "reviewCount",
  "xp",
  "systemTags",
  "specialties",
  "stack",
  "helpRequest",
  "mentorAvailable",
  "collaborationAvailable",
  "profileVisible",
  "showSocialLinks",
  "showActivity",
];
const missionIds = new Set(["caso", "sonda", "matriz"]);
const trackIds = new Set(practiceTracks.map((track) => track.id));
const contentTagSet = new Set<string>(contentTags);
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const array = (value: unknown, max: number) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ].slice(0, max)
    : [];
const safeUrl = (value: unknown) => {
  const result = text(value, 2048);
  return !result || /^https:\/\//i.test(result) ? result : "";
};
const slugFor = (value: string, fallback: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72) || fallback;

function publicProfile(uid: string, profile: ProfileData) {
  return Object.fromEntries(
    publicFields.map((key) => [key, key === "uid" ? uid : profile[key]]),
  );
}

async function authenticated(request: Request) {
  const raw = request.headers.get("authorization");
  if (!raw?.startsWith("Bearer ")) throw new Error("Sessão inválida. Entre novamente.");
  return adminAuth().verifyIdToken(raw.slice(7));
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const { action, payload = {} } = (await request.json()) as {
      action?: string;
      payload?: Record<string, unknown>;
    };
    const db = adminDb();

    if (action === "interest.register") {
      const email = text(payload.email, 254).toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return error("Informe um e-mail válido.");
      await db
        .collection("interestRequests")
        .add({ email, source: "site", createdAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ ok: true });
    }

    if (action === "newsletter.subscribe") {
      const email = text(payload.email, 254).toLowerCase();
      const topics = array(payload.topics, 6).filter((tag) => contentTagSet.has(tag));
      if (!/^\S+@\S+\.\S+$/.test(email)) return error("Informe um e-mail válido.");
      await db.collection("newsletterSubscribers").doc(email).set(
        {
          email,
          topics,
          status: "pending-confirmation",
          source: "newsletter-page",
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return NextResponse.json({ ok: true });
    }

    const user = await authenticated(request);
    const uid = user.uid;
    const profileRef = db.collection("profiles").doc(uid);

    if (action === "profile.bootstrap") {
      await db.runTransaction(async (transaction) => {
        if ((await transaction.get(profileRef)).exists) return;
        const email = user.email || "";
        const handle =
          (email.split("@")[0] || `membro${uid.slice(0, 6)}`)
            .replace(/[^a-zA-Z0-9_-]/g, "")
            .slice(0, 24) || `membro${uid.slice(0, 6)}`;
        const profile = {
          uid,
          displayName: text(payload.displayName, 60) || handle,
          email,
          handle,
          bio: "",
          photoURL: "",
          bannerURL: "",
          links: { github: "", linkedin: "", instagram: "", x: "", website: "" },
          badgeIds: ["first-signal"],
          completedMissionIds: [],
          completedLabIds: [],
          favoriteMissionIds: [],
          activeMissionIds: [],
          featuredMissionIds: [],
          featuredBadgeIds: [],
          savedProfileIds: [],
          blockedUserIds: [],
          recentMissionIds: [],
          systemTags: [],
          specialties: [],
          stack: [],
          helpRequest: "",
          mentorAvailable: false,
          collaborationAvailable: false,
          profileVisible: true,
          showSocialLinks: true,
          showActivity: true,
          contributionCount: 0,
          reviewCount: 0,
          xp: 0,
          role: "member",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        transaction.set(profileRef, profile);
        transaction.set(db.collection("memberProfiles").doc(uid), {
          ...publicProfile(uid, profile),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "content.discussion.create") {
      const title = text(payload.title, 120);
      const excerpt = text(payload.content, 1200);
      const tags = array(payload.tags, 5).filter((tag) => contentTagSet.has(tag));
      if (title.length < 12 || excerpt.length < 20)
        return error("Escreva um título e um contexto com ao menos 20 caracteres.");
      if (/https?:\/\//i.test(`${title} ${excerpt}`))
        return error("Links não são permitidos em novas discussões por enquanto.");
      const postRef = db.collection("contentPosts").doc();
      await db.runTransaction(async (transaction) => {
        const profile = await transaction.get(profileRef);
        if (!profile.exists) throw new Error("Perfil não encontrado.");
        const latest = profile.data()?.lastDiscussionAt;
        if (latest?.toMillis && Date.now() - latest.toMillis() < 5 * 60 * 1000)
          throw new Error("Aguarde alguns minutos antes de abrir outra discussão.");
        const handle = text(profile.data()?.handle, 24);
        transaction.create(postRef, {
          kind: "discussion",
          title,
          slug: `${slugFor(title, "discussao")}-${postRef.id.slice(0, 6)}`,
          excerpt,
          body: excerpt,
          tags,
          authorId: uid,
          authorName: text(profile.data()?.displayName, 60) || handle || "Membro",
          status: "published",
          visibility: "members",
          reactionCount: 0,
          commentCount: 0,
          publishedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });
        transaction.update(profileRef, {
          lastDiscussionAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      return NextResponse.json({ ok: true, id: postRef.id });
    }

    if (action === "content.article.create") {
      const title = text(payload.title, 120);
      const excerpt = text(payload.excerpt, 320);
      const body = text(payload.body, 8_000);
      const whyItMatters = text(payload.whyItMatters, 400);
      const tags = array(payload.tags, 5).filter((tag) => contentTagSet.has(tag));
      if (title.length < 12 || excerpt.length < 40 || body.length < 180)
        return error("Escreva título, resumo e corpo suficientes para o artigo.");
      if (/https?:\/\//i.test(`${title} ${excerpt} ${body} ${whyItMatters}`))
        return error("Links não são permitidos em artigos da comunidade por enquanto.");
      const postRef = db.collection("contentPosts").doc();
      await db.runTransaction(async (transaction) => {
        const profile = await transaction.get(profileRef);
        if (!profile.exists) throw new Error("Perfil não encontrado.");
        const latest = profile.data()?.lastArticleAt;
        if (latest?.toMillis && Date.now() - latest.toMillis() < 15 * 60 * 1000)
          throw new Error("Aguarde alguns minutos antes de publicar outro artigo.");
        const handle = text(profile.data()?.handle, 24);
        transaction.create(postRef, {
          kind: "article",
          title,
          slug: `${slugFor(title, "artigo")}-${postRef.id.slice(0, 6)}`,
          excerpt,
          body,
          whyItMatters,
          tags,
          authorId: uid,
          authorName: text(profile.data()?.displayName, 60) || handle || "Membro",
          status: "published",
          visibility: "public",
          reactionCount: 0,
          commentCount: 0,
          viewCount: 0,
          publishedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        });
        transaction.update(profileRef, {
          lastArticleAt: FieldValue.serverTimestamp(),
          xp: FieldValue.increment(30),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          { xp: FieldValue.increment(30), updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true, id: postRef.id });
    }

    if (action === "content.comment.create") {
      const postId = text(payload.postId, 128);
      const body = text(payload.body, 800);
      if (!postId || body.length < 8)
        return error("Escreva uma resposta com ao menos 8 caracteres.");
      if (/https?:\/\//i.test(body))
        return error("Links não são permitidos em respostas por enquanto.");
      const postRef = db.collection("contentPosts").doc(postId);
      const commentRef = db.collection("contentComments").doc();
      await db.runTransaction(async (transaction) => {
        const [post, profile] = await Promise.all([
          transaction.get(postRef),
          transaction.get(profileRef),
        ]);
        if (!post.exists || post.data()?.status !== "published")
          throw new Error("Discussão não encontrada.");
        if (!profile.exists) throw new Error("Perfil não encontrado.");
        const latest = profile.data()?.lastCommentAt;
        if (latest?.toMillis && Date.now() - latest.toMillis() < 20 * 1000)
          throw new Error("Aguarde alguns segundos antes de enviar outra resposta.");
        transaction.create(commentRef, {
          postId,
          authorId: uid,
          authorName: text(profile.data()?.displayName, 60) || "Membro",
          body,
          status: "published",
          createdAt: FieldValue.serverTimestamp(),
        });
        transaction.update(postRef, {
          commentCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.update(profileRef, {
          lastCommentAt: FieldValue.serverTimestamp(),
          xp: FieldValue.increment(5),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          { xp: FieldValue.increment(5), updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "content.reaction.toggle") {
      const postId = text(payload.postId, 128);
      const enabled = payload.enabled === true;
      if (!postId) return error("Conteúdo inválido.");
      const postRef = db.collection("contentPosts").doc(postId);
      const reactionRef = db.collection("contentReactions").doc(`${uid}_${postId}`);
      await db.runTransaction(async (transaction) => {
        const [post, reaction, profile] = await Promise.all([
          transaction.get(postRef),
          transaction.get(reactionRef),
          transaction.get(profileRef),
        ]);
        if (!post.exists || post.data()?.status !== "published")
          throw new Error("Conteúdo não encontrado.");
        const latest = profile.data()?.lastReactionAt;
        if (latest?.toMillis && Date.now() - latest.toMillis() < 1200)
          throw new Error("Aguarde um instante antes de reagir novamente.");
        if (enabled && !reaction.exists) {
          transaction.create(reactionRef, {
            postId,
            authorId: uid,
            createdAt: FieldValue.serverTimestamp(),
          });
          transaction.update(postRef, { reactionCount: FieldValue.increment(1) });
        }
        if (!enabled && reaction.exists) {
          transaction.delete(reactionRef);
          transaction.update(postRef, { reactionCount: FieldValue.increment(-1) });
        }
        transaction.set(
          profileRef,
          {
            lastReactionAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "content.comment.best") {
      const postId = text(payload.postId, 128);
      const commentId = text(payload.commentId, 128);
      const postRef = db.collection("contentPosts").doc(postId);
      const commentRef = db.collection("contentComments").doc(commentId);
      await db.runTransaction(async (transaction) => {
        const [post, comment] = await Promise.all([
          transaction.get(postRef),
          transaction.get(commentRef),
        ]);
        if (
          !post.exists ||
          post.data()?.authorId !== uid ||
          !comment.exists ||
          comment.data()?.postId !== postId
        )
          throw new Error("Você não pode destacar esta resposta.");
        transaction.update(postRef, { bestCommentId: commentId });
        transaction.update(commentRef, { bestAnswer: true });
        if (comment.data()?.authorId !== uid) {
          const authorId = String(comment.data()?.authorId);
          transaction.set(
            db.collection("profiles").doc(authorId),
            { xp: FieldValue.increment(15), updatedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );
          transaction.set(
            db.collection("memberProfiles").doc(authorId),
            { xp: FieldValue.increment(15), updatedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );
        }
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "content.report") {
      const targetId = text(payload.targetId, 128);
      const targetType = payload.targetType === "comment" ? "comment" : "post";
      const reason = text(payload.reason, 400);
      if (!targetId || reason.length < 8)
        return error("Explique o motivo da denúncia.");
      await db.collection("contentReports").doc(`${uid}_${targetType}_${targetId}`).set(
        {
          targetId,
          targetType,
          reason,
          reporterId: uid,
          status: "open",
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "content.read.track") {
      const postId = text(payload.postId, 128);
      if (!postId) return error("Conteúdo inválido.");
      const postRef = db.collection("contentPosts").doc(postId);
      const readRef = db.collection("contentReads").doc(`${uid}_${postId}`);
      await db.runTransaction(async (transaction) => {
        const [post, read] = await Promise.all([
          transaction.get(postRef),
          transaction.get(readRef),
        ]);
        if (!post.exists || post.data()?.status !== "published")
          throw new Error("Conteúdo não encontrado.");
        if (!read.exists) {
          transaction.create(readRef, {
            postId,
            uid,
            createdAt: FieldValue.serverTimestamp(),
          });
          transaction.update(postRef, { viewCount: FieldValue.increment(1) });
        }
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "content.news.translate") {
      const postId = text(payload.postId, 128);
      const language = targetLanguage(payload.language);
      const [post, profile] = await Promise.all([
        db.collection("contentPosts").doc(postId).get(),
        profileRef.get(),
      ]);
      if (
        !post.exists ||
        post.data()?.kind !== "radar" ||
        post.data()?.status !== "published"
      )
        return error("Notícia não encontrada.", 404);
      if (!profile.exists) return error("Perfil não encontrado.", 404);
      const cached = post.data()?.translations?.[language];
      if (cached?.title && cached?.excerpt)
        return NextResponse.json({
          translation: { language, title: cached.title, excerpt: cached.excerpt },
        });
      const latest = profile.data()?.lastNewsTranslationAt;
      if (latest?.toMillis && Date.now() - latest.toMillis() < 5_000)
        return error("Aguarde alguns segundos antes de traduzir outro item.", 429);
      const translation = await translateNewsMetadata(
        {
          title: text(post.data()?.title, 240),
          excerpt: text(post.data()?.excerpt, 1400),
        },
        language,
      );
      await Promise.all([
        post.ref.set(
          {
            translations: {
              [language]: {
                title: text(translation.title, 240),
                excerpt: text(translation.excerpt, 1400),
                translatedAt: FieldValue.serverTimestamp(),
              },
            },
          },
          { merge: true },
        ),
        profileRef.set(
          { lastNewsTranslationAt: FieldValue.serverTimestamp() },
          { merge: true },
        ),
      ]);
      return NextResponse.json({ translation: { language, ...translation } });
    }

    if (action === "profile.update") {
      const current = await profileRef.get();
      if (!current.exists) return error("Perfil não encontrado.", 404);
      const source =
        payload.profile && typeof payload.profile === "object"
          ? (payload.profile as Record<string, unknown>)
          : {};
      const handle = text(source.handle, 24).replace(/[^a-zA-Z0-9_-]/g, "");
      if (handle.length < 3)
        return error("O identificador precisa ter ao menos 3 caracteres.");
      const duplicate = await db
        .collection("profiles")
        .where("handle", "==", handle)
        .limit(2)
        .get();
      if (duplicate.docs.some((item) => item.id !== uid))
        return error("Este identificador já está em uso.", 409);
      const linksSource =
        source.links && typeof source.links === "object" ? (source.links as Links) : {};
      const update = {
        displayName: text(source.displayName, 60),
        handle,
        bio: text(source.bio, 320),
        photoURL: safeUrl(source.photoURL),
        bannerURL: safeUrl(source.bannerURL),
        links: {
          github: safeUrl(linksSource.github),
          linkedin: safeUrl(linksSource.linkedin),
          instagram: safeUrl(linksSource.instagram),
          x: safeUrl(linksSource.x),
          website: safeUrl(linksSource.website),
        },
        specialties: array(source.specialties, 8),
        stack: array(source.stack, 12),
        featuredMissionIds: array(source.featuredMissionIds, 3),
        featuredBadgeIds: array(source.featuredBadgeIds, 3),
        helpRequest: text(source.helpRequest, 240),
        mentorAvailable: source.mentorAvailable === true,
        collaborationAvailable: source.collaborationAvailable === true,
        profileVisible: source.profileVisible === true,
        showSocialLinks: source.showSocialLinks === true,
        showActivity: source.showActivity === true,
        updatedAt: FieldValue.serverTimestamp(),
      };
      const currentData = current.data()!;
      await db.runTransaction(async (transaction) => {
        transaction.update(profileRef, update);
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          {
            ...publicProfile(uid, { ...currentData, ...update }),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "mission.favorite" || action === "mission.activity") {
      const missionId = text(payload.missionId, 64);
      if (!missionIds.has(missionId)) return error("Missão inválida.");
      const active = payload.active === true;
      const field =
        action === "mission.favorite" ? "favoriteMissionIds" : "activeMissionIds";
      await profileRef.update({
        [field]: active
          ? FieldValue.arrayUnion(missionId)
          : FieldValue.arrayRemove(missionId),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "contribution.submit") {
      const missionId = text(payload.missionId, 64);
      const content = text(payload.content, 1200);
      if (!missionIds.has(missionId) || content.length < 20)
        return error("Envie uma contribuição de pelo menos 20 caracteres.");
      const contributionRef = db.collection("contributions").doc();
      await db.runTransaction(async (transaction) => {
        const profileSnapshot = await transaction.get(profileRef);
        if (!profileSnapshot.exists) throw new Error("Perfil não encontrado.");
        const profile = profileSnapshot.data()!;
        const count = Number(profile.contributionCount || 0) + 1;
        const complete = new Set(array(profile.completedMissionIds, 100));
        complete.add(missionId);
        const earned = [
          "first-contribution",
          ...(count >= 3 ? ["field-notes"] : []),
          ...(complete.size >= 5 ? ["incident-trace"] : []),
        ];
        transaction.create(contributionRef, {
          missionId,
          authorId: uid,
          content,
          status: "pending-review",
          createdAt: FieldValue.serverTimestamp(),
        });
        const update = {
          contributionCount: count,
          completedMissionIds: [...complete],
          recentMissionIds: FieldValue.arrayUnion(missionId),
          badgeIds: FieldValue.arrayUnion(...earned),
          updatedAt: FieldValue.serverTimestamp(),
        };
        transaction.update(profileRef, update);
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          {
            contributionCount: count,
            completedMissionIds: [...complete],
            recentMissionIds: FieldValue.arrayUnion(missionId),
            badgeIds: FieldValue.arrayUnion(...earned),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.start") {
      const lab = getLabById(text(payload.labId, 64));
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      await db.runTransaction(async (transaction) => {
        const prerequisites = await Promise.all(
          lab.prerequisites.map((id) =>
            transaction.get(db.collection("labProgress").doc(`${uid}_${id}`)),
          ),
        );
        if (
          prerequisites.some(
            (item) => !["completed"].includes(String(item.data()?.status)),
          )
        )
          throw new Error(
            "Envie a evidência dos pré-requisitos antes de iniciar este lab.",
          );
        const existing = await transaction.get(progressRef);
        if (existing.data()?.status === "completed") return;
        transaction.set(
          progressRef,
          {
            uid,
            labId: lab.id,
            status: "active",
            evidenceCount: Number(existing.data()?.evidenceCount || 0),
            completedSteps: Array.isArray(existing.data()?.completedSteps)
              ? existing.data()!.completedSteps
              : [],
            simulationActions: Array.isArray(existing.data()?.simulationActions)
              ? existing.data()!.simulationActions
              : [],
            challengeSolved: Boolean(existing.data()?.challengeSolved),
            startedAt: existing.data()?.startedAt || FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.checklist.update") {
      const lab = getLabById(text(payload.labId, 64));
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      const completedSteps = array(payload.completedSteps, lab.checklist.length);
      if (completedSteps.some((step) => !lab.checklist.includes(step)))
        return error("Etapa inválida.");
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      const progress = await progressRef.get();
      if (
        !progress.exists ||
        !["active", "submitted"].includes(String(progress.data()?.status))
      )
        return error("Inicie o lab antes de atualizar o roteiro.");
      await progressRef.update({
        completedSteps,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.evidence.submit") {
      const lab = getLabById(text(payload.labId, 64));
      const content = text(payload.content, 1500);
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      if (content.length < 80)
        return error("A evidência precisa ter ao menos 80 caracteres.");
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      const evidenceRef = db.collection("labEvidence").doc();
      await db.runTransaction(async (transaction) => {
        const progress = await transaction.get(progressRef);
        if (progress.data()?.status !== "active")
          throw new Error("Inicie o lab antes de enviar uma evidência.");
        transaction.create(evidenceRef, {
          uid,
          labId: lab.id,
          content,
          status: "pending-review",
          createdAt: FieldValue.serverTimestamp(),
        });
        transaction.update(progressRef, {
          status: "submitted",
          evidenceCount: Number(progress.data()?.evidenceCount || 0) + 1,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.simulation.action") {
      const lab = getLabById(text(payload.labId, 64));
      const actionId = text(payload.actionId, 64);
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      if (!labSimulation(lab).requiredActions.includes(actionId))
        return error("Ação de laboratório inválida.");
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      const progress = await progressRef.get();
      if (progress.data()?.status !== "active")
        return error("Inicie o lab antes de operar a estação.");
      await progressRef.update({
        simulationActions: FieldValue.arrayUnion(actionId),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.challenge.solve") {
      const lab = getLabById(text(payload.labId, 64));
      const answer = text(payload.answer, 180);
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      if (answer.length < 3) return error("Registre uma resposta antes de validar.");
      if (!validatesLabChallenge(lab.id, answer)) {
        return error(
          "Ainda não é essa a conclusão. Revise os artefatos e tente novamente.",
        );
      }
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      const progress = await progressRef.get();
      if (progress.data()?.status !== "active")
        return error("Inicie o lab antes de validar a conclusão.");
      await progressRef.update({
        challengeSolved: true,
        simulationActions: FieldValue.arrayUnion("challenge.solve"),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "lab.complete") {
      const lab = getLabById(text(payload.labId, 64));
      if (!lab || lab.status !== "open") return error("Lab indisponível.", 404);
      const simulation = labSimulation(lab);
      const progressRef = db.collection("labProgress").doc(`${uid}_${lab.id}`);
      let awardedXp = 0;
      await db.runTransaction(async (transaction) => {
        const [progressSnapshot, profileSnapshot] = await Promise.all([
          transaction.get(progressRef),
          transaction.get(profileRef),
        ]);
        if (!progressSnapshot.exists || !profileSnapshot.exists)
          throw new Error("Inicie o lab antes de concluir a operação.");
        const progress = progressSnapshot.data()!;
        if (progress.status === "completed") return;
        if (progress.status !== "active")
          throw new Error("A estação não está disponível para conclusão.");
        const actions = new Set(array(progress.simulationActions, 30));
        if (simulation.requiredActions.some((item) => !actions.has(item)))
          throw new Error(
            "Conclua os objetivos técnicos da estação antes de finalizar.",
          );
        if (!progress.challengeSolved)
          throw new Error("Valide a conclusão do cenário antes de finalizar.");
        const profile = profileSnapshot.data()!;
        const completedLabs = new Set(array(profile.completedLabIds, 100));
        completedLabs.add(lab.id);
        awardedXp = simulation.xp;
        const xp = Number(profile.xp || 0) + awardedXp;
        const badgeIds = [
          "signal-hunter",
          ...(completedLabs.size >= 3 ? ["incident-trace"] : []),
        ];
        transaction.update(progressRef, {
          status: "completed",
          completedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.update(profileRef, {
          completedLabIds: [...completedLabs],
          xp,
          badgeIds: FieldValue.arrayUnion(...badgeIds),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          {
            completedLabIds: [...completedLabs],
            xp,
            badgeIds: FieldValue.arrayUnion(...badgeIds),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true, xp: awardedXp });
    }

    if (action === "lab.review.queue") {
      const pending = await db
        .collection("labEvidence")
        .where("status", "==", "pending-review")
        .limit(30)
        .get();
      const items = pending.docs
        .map((item) => {
          const evidence = item.data();
          const lab = getLabById(String(evidence.labId || ""));
          if (!lab || evidence.uid === uid) return null;
          return {
            id: item.id,
            labId: lab.id,
            labTitle: lab.title,
            objective: lab.objective,
            content: text(evidence.content, 1500),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 6);
      return NextResponse.json({ items });
    }

    if (action === "lab.review.submit") {
      const evidenceId = text(payload.evidenceId, 128);
      const decision = payload.decision === "accepted" ? "accepted" : "adjust";
      const feedback = text(payload.feedback, 600);
      if (!evidenceId || feedback.length < 40)
        return error("Escreva um retorno com ao menos 40 caracteres.");
      const evidenceRef = db.collection("labEvidence").doc(evidenceId);
      await db.runTransaction(async (transaction) => {
        const evidenceSnapshot = await transaction.get(evidenceRef);
        if (!evidenceSnapshot.exists) throw new Error("Evidência não encontrada.");
        const evidence = evidenceSnapshot.data()!;
        const authorId = String(evidence.uid || "");
        const lab = getLabById(String(evidence.labId || ""));
        if (!lab || authorId === uid || evidence.status !== "pending-review")
          throw new Error("Esta evidência não está disponível para revisão.");
        const reviewRef = db.collection("labReviews").doc(`${evidenceId}_${uid}`);
        if ((await transaction.get(reviewRef)).exists)
          throw new Error("Você já revisou esta evidência.");
        const authorProfileRef = db.collection("profiles").doc(authorId);
        const authorProgressRef = db
          .collection("labProgress")
          .doc(`${authorId}_${lab.id}`);
        const reviewerProfileRef = profileRef;
        const [authorProfile, authorProgress, reviewerProfile] = await Promise.all([
          transaction.get(authorProfileRef),
          transaction.get(authorProgressRef),
          transaction.get(reviewerProfileRef),
        ]);
        if (!authorProfile.exists || !authorProgress.exists || !reviewerProfile.exists)
          throw new Error("Não foi possível finalizar a revisão.");
        transaction.create(reviewRef, {
          evidenceId,
          authorId,
          reviewerId: uid,
          labId: lab.id,
          decision,
          feedback,
          createdAt: FieldValue.serverTimestamp(),
        });
        transaction.update(evidenceRef, {
          status: decision === "accepted" ? "reviewed" : "needs-adjustment",
          reviewedAt: FieldValue.serverTimestamp(),
        });
        if (decision === "accepted") {
          transaction.update(authorProgressRef, {
            status: "reviewed",
            reviewedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.update(authorProfileRef, {
            completedLabIds: FieldValue.arrayUnion(lab.id),
            badgeIds: FieldValue.arrayUnion("signal-hunter"),
            updatedAt: FieldValue.serverTimestamp(),
          });
          transaction.set(
            db.collection("memberProfiles").doc(authorId),
            {
              completedLabIds: FieldValue.arrayUnion(lab.id),
              badgeIds: FieldValue.arrayUnion("signal-hunter"),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        } else {
          transaction.update(authorProgressRef, {
            status: "active",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        const reviewCount = Number(reviewerProfile.data()?.reviewCount || 0) + 1;
        transaction.update(reviewerProfileRef, {
          reviewCount,
          badgeIds: FieldValue.arrayUnion("peer-review"),
          updatedAt: FieldValue.serverTimestamp(),
        });
        transaction.set(
          db.collection("memberProfiles").doc(uid),
          {
            reviewCount,
            badgeIds: FieldValue.arrayUnion("peer-review"),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "operations.watchlist.update") {
      const ids = array(payload.ids, 12).filter((id) => /^[a-z0-9-]{2,40}$/i.test(id));
      await Promise.all([
        profileRef.set(
          { operationWatchlist: ids, updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        ),
        db
          .collection("operationWatchlists")
          .doc(uid)
          .set({ uid, ids, updatedAt: FieldValue.serverTimestamp() }),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (action === "community.dashboard") {
      const [notifications, operationAlerts] = await Promise.all([
        db.collection("communityNotifications").where("uid", "==", uid).limit(12).get(),
        db.collection("operationAlerts").where("uid", "==", uid).limit(8).get(),
      ]);
      const alerts = [
        ...notifications.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            title: text(data.title, 180),
            href: safeUrl(data.href) || "/perfil",
            kind: text(data.kind, 40),
          };
        }),
        ...operationAlerts.docs.map((item) => {
          const data = item.data();
          const postId = text(data.postId, 128);
          return {
            id: item.id,
            title: `Watchlist: ${text(data.title, 160)}`,
            href: postId.startsWith("radar_")
              ? `/noticias/${postId.replace("radar_", "radar-")}`
              : "/operacoes",
            kind: "watchlist",
          };
        }),
      ];
      return NextResponse.json({ alerts });
    }

    if (action === "content.save.toggle") {
      const postId = text(payload.postId, 128);
      const enabled = payload.enabled === true;
      if (!postId) return error("Conteúdo inválido.");
      const post = await db.collection("contentPosts").doc(postId).get();
      if (!post.exists || post.data()?.status !== "published")
        return error("Conteúdo não encontrado.", 404);
      const ref = db.collection("savedContent").doc(`${uid}_${postId}`);
      if (enabled)
        await ref.set({ uid, postId, createdAt: FieldValue.serverTimestamp() });
      else await ref.delete();
      return NextResponse.json({ ok: true });
    }

    if (action === "content.saved.list") {
      const saved = await db
        .collection("savedContent")
        .where("uid", "==", uid)
        .limit(80)
        .get();
      return NextResponse.json({
        postIds: saved.docs.map((item) => text(item.data().postId, 128)),
      });
    }

    if (action === "operations.dashboard") {
      const [watchlist, alerts, progress] = await Promise.all([
        db.collection("operationWatchlists").doc(uid).get(),
        db.collection("operationAlerts").where("uid", "==", uid).limit(12).get(),
        db.collection("trackProgress").where("uid", "==", uid).limit(12).get(),
      ]);
      return NextResponse.json({
        watchlist: array(watchlist.data()?.ids, 12),
        alerts: alerts.docs.map((item) => ({ id: item.id, ...item.data() })),
        progress: progress.docs.map((item) => ({
          trackId: text(item.data()?.trackId, 40),
          completedSteps: array(item.data()?.completedSteps, 4),
        })),
      });
    }

    if (action === "operations.track.progress") {
      const trackId = text(payload.trackId, 40);
      const completedSteps = array(payload.completedSteps, 8).filter((step) =>
        /^[1-4]$/.test(step),
      );
      if (!trackIds.has(trackId)) return error("Trilha inválida.");
      await db
        .collection("trackProgress")
        .doc(`${uid}_${trackId}`)
        .set(
          {
            uid,
            trackId,
            completedSteps,
            status: completedSteps.length === 4 ? "completed" : "active",
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      return NextResponse.json({ ok: true, completedSteps });
    }

    if (action === "operations.room.create") {
      const subject = text(payload.subject, 140);
      if (subject.length < 12) return error("Descreva a sala com mais contexto.");
      if (/https?:\/\//i.test(subject))
        return error("Links não são permitidos no título da sala.");
      const profile = await profileRef.get();
      if (!profile.exists) return error("Perfil não encontrado.", 404);
      const roomRef = db.collection("operationRooms").doc();
      await roomRef.set({
        subject,
        status: "open",
        ownerId: uid,
        ownerName: text(profile.data()?.displayName, 60) || "Membro",
        memberIds: [uid],
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return NextResponse.json({ ok: true, id: roomRef.id });
    }

    if (action === "operations.mentorship.goal") {
      const goal = text(payload.goal, 180);
      if (goal.length < 12) return error("Descreva seu objetivo com mais contexto.");
      await profileRef.set(
        { mentorshipGoal: goal, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "moderation.queue" || action === "moderation.resolve") {
      const profile = await profileRef.get();
      if (
        !profile.exists ||
        !["moderator", "admin"].includes(String(profile.data()?.role))
      )
        return error("Acesso restrito à equipe.", 403);
      if (action === "moderation.queue") {
        const reports = await db
          .collection("contentReports")
          .where("status", "==", "open")
          .limit(40)
          .get();
        return NextResponse.json({
          items: reports.docs.map((item) => ({ id: item.id, ...item.data() })),
        });
      }
      const reportId = text(payload.reportId, 128);
      const decision = payload.decision === "hide" ? "hide" : "dismiss";
      const reportRef = db.collection("contentReports").doc(reportId);
      const report = await reportRef.get();
      if (!report.exists) return error("Denúncia não encontrada.", 404);
      const targetType = String(report.data()?.targetType || "");
      const targetId = text(report.data()?.targetId, 128);
      if (decision === "hide" && targetType === "post")
        await db
          .collection("contentPosts")
          .doc(targetId)
          .set(
            { status: "hidden", updatedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );
      if (decision === "hide" && targetType === "comment")
        await db
          .collection("contentComments")
          .doc(targetId)
          .set(
            { status: "hidden", updatedAt: FieldValue.serverTimestamp() },
            { merge: true },
          );
      await Promise.all([
        reportRef.set(
          {
            status: decision === "hide" ? "resolved-hidden" : "dismissed",
            resolvedBy: uid,
            resolvedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        ),
        db.collection("moderationActions").add({
          reportId,
          targetId,
          targetType,
          decision,
          moderatorId: uid,
          createdAt: FieldValue.serverTimestamp(),
        }),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (
      action === "network.follow" ||
      action === "network.save" ||
      action === "network.block"
    ) {
      const targetId = text(payload.targetId, 128);
      const enabled = payload.enabled === true;
      if (!targetId || targetId === uid) return error("Operação inválida.");
      if (action === "network.follow") {
        const target = await db.collection("profiles").doc(targetId).get();
        if (!target.exists || array(target.data()?.blockedUserIds, 500).includes(uid))
          return error("Este perfil não está disponível.", 403);
        const followRef = db.collection("profileFollows").doc(`${uid}_${targetId}`);
        if (enabled)
          await followRef.set({
            followerId: uid,
            followingId: targetId,
            createdAt: FieldValue.serverTimestamp(),
          });
        else await followRef.delete();
      } else {
        const field = action === "network.save" ? "savedProfileIds" : "blockedUserIds";
        const update: Record<string, unknown> = {
          [field]: enabled
            ? FieldValue.arrayUnion(targetId)
            : FieldValue.arrayRemove(targetId),
          updatedAt: FieldValue.serverTimestamp(),
        };
        await profileRef.update(update);
        if (action === "network.block" && enabled)
          await db.collection("profileFollows").doc(`${uid}_${targetId}`).delete();
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "network.report") {
      const targetId = text(payload.targetId, 128);
      const reason = text(payload.reason, 400);
      if (!targetId || targetId === uid || !reason)
        return error("Informe o motivo da denúncia.");
      await db.collection("memberReports").add({
        authorId: uid,
        targetId,
        reason,
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "invite.send") {
      const targetId = text(payload.targetId, 128);
      const kind =
        payload.kind === "mentorship"
          ? "mentorship"
          : payload.kind === "collaboration"
            ? "collaboration"
            : null;
      if (!targetId || targetId === uid || !kind) return error("Convite inválido.");
      const [sender, recipient] = await Promise.all([
        profileRef.get(),
        db.collection("profiles").doc(targetId).get(),
      ]);
      if (
        !sender.exists ||
        !recipient.exists ||
        array(recipient.data()?.blockedUserIds, 500).includes(uid)
      )
        return error("Este perfil não está disponível.", 403);
      await db.collection("profileInvites").add({
        senderId: uid,
        recipientId: targetId,
        senderName: sender.data()!.displayName,
        senderHandle: sender.data()!.handle,
        recipientName: recipient.data()!.displayName,
        recipientHandle: recipient.data()!.handle,
        kind,
        message: text(payload.message, 280),
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "invite.status") {
      const id = text(payload.id, 128);
      const status = payload.status;
      if (!id || !["accepted", "declined", "cancelled"].includes(String(status)))
        return error("Atualização inválida.");
      const inviteRef = db.collection("profileInvites").doc(id);
      await db.runTransaction(async (transaction) => {
        const invite = await transaction.get(inviteRef);
        if (!invite.exists) throw new Error("Convite não encontrado.");
        const data = invite.data()!;
        const allowed =
          data.status === "pending" &&
          ((data.recipientId === uid &&
            (status === "accepted" || status === "declined")) ||
            (data.senderId === uid && status === "cancelled"));
        if (!allowed) throw new Error("Você não pode atualizar este convite.");
        transaction.update(inviteRef, {
          status,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      return NextResponse.json({ ok: true });
    }

    return error("Ação não reconhecida.", 404);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Erro interno.";
    return error(message, message.includes("Sessão") ? 401 : 500);
  }
}
