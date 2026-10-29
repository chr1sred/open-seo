import {
  createProject,
  deleteProject,
  updateProject,
  getOrCreateDefaultProject,
  getProject,
  getSavedKeywords,
  getSerpAnalysis,
  listProjects,
  removeSavedKeyword,
  research,
  saveKeywords,
  getRankHistory,
  getLatestProjectRankings,
} from "@/server/features/keywords/services/research";


export const KeywordResearchService = {
  research,
  getSerpAnalysis,
  listProjects,
  createProject,
  deleteProject,
  updateProject,
  saveKeywords,
  getSavedKeywords,
  removeSavedKeyword,
  getOrCreateDefaultProject,
  getProject,
  getRankHistory,
  getLatestProjectRankings,
} as const;
