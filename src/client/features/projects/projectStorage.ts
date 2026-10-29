const LAST_PROJECT_KEY = "openseo-last-project-id";

export function loadLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function saveLastProjectId(projectId: string) {
  try {
    localStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
    // storage unavailable - silently ignore
  }
}
