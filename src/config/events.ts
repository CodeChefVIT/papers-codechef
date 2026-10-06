export interface EventData {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  accent: "purple" | "amber" | "green" | "rose";
  registrationUrl: string;
  landingPageUrl: string;
  imageUrl?: string;
  dates?: string;
  location?: string;
  logoType: "clueminati" | "cookoff";
}

export const EVENTS: EventData[] = [];

/**
 * Always pick 100% randomly between available events on every load.
 */
export function getSubjectEvent(_subjectKey?: string | null): EventData | null {
  if (EVENTS.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * EVENTS.length);
  return EVENTS[randomIndex]!;
}
