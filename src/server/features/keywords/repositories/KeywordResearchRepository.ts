import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { keywordMetrics, projects, savedKeywords } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

type KeywordMetricInput = {
  projectId: string;
  keyword: string;
  locationCode: number;
  languageCode: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  keywordDifficulty: number | null;
  intent: string | null;
  monthlySearchesJson: string;
};

// D1 accepts at most 100 statements per batch() call.
const D1_BATCH_SIZE = 100;

/**
 * Upsert many keyword metrics using one statement per keyword, sent in
 * batches (a multi-row INSERT would exceed D1's 100 bound-parameter limit).
 */
async function upsertKeywordMetrics(items: KeywordMetricInput[]) {
  const fetchedAt = new Date().toISOString();
  const statements = items.map((item) =>
    buildKeywordMetricUpsert(item, fetchedAt),
  );

  for (let i = 0; i < statements.length; i += D1_BATCH_SIZE) {
    const [first, ...rest] = statements.slice(i, i + D1_BATCH_SIZE);
    if (!first) continue;
    await db.batch([first, ...rest]);
  }
}

function buildKeywordMetricUpsert(
  params: KeywordMetricInput,
  fetchedAt: string,
) {
  return db
    .insert(keywordMetrics)
    .values({
      projectId: params.projectId,
      keyword: params.keyword,
      locationCode: params.locationCode,
      languageCode: params.languageCode,
      searchVolume: params.searchVolume,
      cpc: params.cpc,
      competition: params.competition,
      keywordDifficulty: params.keywordDifficulty,
      intent: params.intent,
      monthlySearches: params.monthlySearchesJson,
      fetchedAt,
    })
    .onConflictDoUpdate({
      target: [
        keywordMetrics.projectId,
        keywordMetrics.keyword,
        keywordMetrics.locationCode,
        keywordMetrics.languageCode,
      ],
      set: {
        searchVolume: params.searchVolume,
        cpc: params.cpc,
        competition: params.competition,
        keywordDifficulty: params.keywordDifficulty,
        intent: params.intent,
        monthlySearches: params.monthlySearchesJson,
        fetchedAt,
      },
    });
}

async function listProjects(userId: string) {
  return db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: desc(projects.createdAt),
  });
}

async function getProject(projectId: string, userId: string) {
  return db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
  });
}

async function getProjectPsiApiKey(projectId: string, userId: string) {
  const project = await getProject(projectId, userId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }
  return project.pagespeedApiKey ?? null;
}

async function setProjectPsiApiKey(
  projectId: string,
  userId: string,
  apiKey: string,
) {
  const project = await getProject(projectId, userId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(projects)
    .set({ pagespeedApiKey: apiKey })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

async function clearProjectPsiApiKey(projectId: string, userId: string) {
  const project = await getProject(projectId, userId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(projects)
    .set({ pagespeedApiKey: null })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

async function createProject(userId: string, name: string, domain?: string) {
  const id = crypto.randomUUID();
  await db.insert(projects).values({
    id,
    userId,
    name,
    domain,
  });
  return id;
}

/**
 * Create the user's default project with a deterministic id so concurrent
 * calls cannot create duplicates.
 */
async function ensureDefaultProject(userId: string, name: string) {
  const id = `default-${userId}`;
  await db
    .insert(projects)
    .values({ id, userId, name })
    .onConflictDoNothing();
  return id;
}

async function updateProject(
  projectId: string,
  userId: string,
  values: { name: string; domain: string | null },
) {
  await db
    .update(projects)
    .set(values)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

async function countSavedKeywordsByProject(userId: string) {
  return db
    .select({ projectId: savedKeywords.projectId, value: count() })
    .from(savedKeywords)
    .innerJoin(projects, eq(projects.id, savedKeywords.projectId))
    .where(eq(projects.userId, userId))
    .groupBy(savedKeywords.projectId);
}

async function deleteProject(projectId: string, userId: string) {
  const project = await getProject(projectId, userId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }
  // savedKeywords cascade-delete via FK
  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

async function countSavedKeywords(projectId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(savedKeywords)
    .where(eq(savedKeywords.projectId, projectId));
  return result?.value ?? 0;
}

async function saveKeywordsToProject(params: {
  projectId: string;
  keywords: string[];
  locationCode: number;
  languageCode: string;
}) {
  // One INSERT per keyword: a single multi-row INSERT exceeds D1's limit of
  // 100 bound parameters per query (5 params per row -> max 20 rows).
  const statements = params.keywords.map((keyword) =>
    db
      .insert(savedKeywords)
      .values({
        id: crypto.randomUUID(),
        projectId: params.projectId,
        keyword,
        locationCode: params.locationCode,
        languageCode: params.languageCode,
      })
      .onConflictDoNothing(),
  );

  for (let i = 0; i < statements.length; i += D1_BATCH_SIZE) {
    const [first, ...rest] = statements.slice(i, i + D1_BATCH_SIZE);
    if (!first) continue;
    await db.batch([first, ...rest]);
  }
}

async function listSavedKeywordsByProject(projectId: string) {
  return db
    .select({ row: savedKeywords, metric: keywordMetrics })
    .from(savedKeywords)
    .leftJoin(
      keywordMetrics,
      and(
        eq(keywordMetrics.keyword, savedKeywords.keyword),
        eq(keywordMetrics.projectId, savedKeywords.projectId),
        eq(keywordMetrics.locationCode, savedKeywords.locationCode),
        eq(keywordMetrics.languageCode, savedKeywords.languageCode),
      ),
    )
    .where(eq(savedKeywords.projectId, projectId))
    .orderBy(desc(savedKeywords.createdAt));
}

async function removeSavedKeyword(savedKeywordId: string) {
  await db.delete(savedKeywords).where(eq(savedKeywords.id, savedKeywordId));
}

async function getSavedKeywordById(savedKeywordId: string) {
  return db.query.savedKeywords.findFirst({
    where: eq(savedKeywords.id, savedKeywordId),
  });
}

export const KeywordResearchRepository = {
  upsertKeywordMetrics,
  listProjects,
  getProject,
  getProjectPsiApiKey,
  setProjectPsiApiKey,
  clearProjectPsiApiKey,
  createProject,
  deleteProject,
  countSavedKeywords,
  saveKeywordsToProject,
  updateProject,
  ensureDefaultProject,
  countSavedKeywordsByProject,
  listSavedKeywordsByProject,
  removeSavedKeyword,
  getSavedKeywordById,
} as const;
