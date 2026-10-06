export type ProgressSource = {
  contributionCount: number;
  completedMissionIds: string[];
  badgeIds: string[];
  xp?: number;
};

const levels = [
  { rank: 1, label: "Iniciante", minimum: 0 },
  { rank: 2, label: "Operador", minimum: 250 },
  { rank: 3, label: "Analista", minimum: 650 },
  { rank: 4, label: "Investigador", minimum: 1300 },
  { rank: 5, label: "Especialista", minimum: 2300 },
] as const;

export function getProfileProgress(source: ProgressSource) {
  const xp =
    100 +
    source.contributionCount * 80 +
    source.completedMissionIds.length * 140 +
    Math.max(0, source.badgeIds.length - 1) * 40 +
    (source.xp || 0);
  const levelIndex = levels.reduce(
    (current, level, index) => (xp >= level.minimum ? index : current),
    0,
  );
  const level = levels[levelIndex];
  const next = levels[levelIndex + 1] || null;
  const range = next ? next.minimum - level.minimum : 1;
  const percent = next
    ? Math.min(100, Math.round(((xp - level.minimum) / range) * 100))
    : 100;
  return { xp, level, next, percent, xpToNext: next ? next.minimum - xp : 0 };
}
