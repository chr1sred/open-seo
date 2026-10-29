import type {
  CreateProjectInput,
  DeleteProjectInput,
  UpdateProjectInput,
} from "@/types/schemas/keywords";
import { AppError } from "@/server/lib/errors";
import { KeywordResearchRepository } from "@/server/features/keywords/repositories/KeywordResearchRepository";

export async function listProjects(userId: string) {
  const [rows, counts] = await Promise.all([
    KeywordResearchRepository.listProjects(userId),
    KeywordResearchRepository.countSavedKeywordsByProject(userId),
  ]);
  const countByProject = new Map(
    counts.map((row) => [row.projectId, row.value]),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    domain: row.domain,
    createdAt: row.createdAt,
    savedKeywordCount: countByProject.get(row.id) ?? 0,
  }));
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const id = await KeywordResearchRepository.createProject(
    userId,
    input.name,
    input.domain || undefined,
  );
  return { id };
}

export async function updateProject(userId: string, input: UpdateProjectInput) {
  const project = await KeywordResearchRepository.getProject(
    input.projectId,
    userId,
  );
  if (!project) {
    throw new AppError("NOT_FOUND");
  }
  await KeywordResearchRepository.updateProject(input.projectId, userId, {
    name: input.name,
    domain: input.domain || null,
  });
  return { success: true };
}

export async function deleteProject(userId: string, input: DeleteProjectInput) {
  await KeywordResearchRepository.deleteProject(input.projectId, userId);
  return { success: true };
}

export async function getOrCreateDefaultProject(userId: string) {
  const existing = await KeywordResearchRepository.listProjects(userId);
  if (existing.length > 0) {
    const first = existing[0];
    return {
      id: first.id,
      name: first.name,
      domain: first.domain,
      createdAt: first.createdAt,
    };
  }

  const id = await KeywordResearchRepository.ensureDefaultProject(
    userId,
    "Padrão",
  );
  const project = await KeywordResearchRepository.getProject(id, userId);
  if (!project) {
    throw new AppError("INTERNAL_ERROR", "Default project was not created");
  }
  return {
    id: project.id,
    name: project.name,
    domain: project.domain,
    createdAt: project.createdAt,
  };
}

export async function getProject(userId: string, projectId: string) {
  const project = await KeywordResearchRepository.getProject(projectId, userId);
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    domain: project.domain,
    createdAt: project.createdAt,
  };
}
