const pinnedSubjectsKey = "userSubjects";

function parseSaved(saved: string): unknown {
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function readPinnedSubjects(): string[] {
  const saved = localStorage.getItem(pinnedSubjectsKey);
  if (!saved) return [];

  const subjects = parseSaved(saved);
  if (Array.isArray(subjects) && subjects.every((subject): subject is string => typeof subject === "string")) {
    return subjects;
  }

  localStorage.removeItem(pinnedSubjectsKey);
  return [];
}
