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

export const EVENTS: EventData[] = [
  {
    id: "clueminati-2026",
    title: "Clueminati 4.0",
    tagline: "The Ultimate Tech Treasure Hunt & Gaming Mystery",
    description: "Hunt for hidden clues, outsmart tricky puzzles, and level up your way to the top in CodeChef-VIT's gaming mystery event at Gravitas !",
    badge: "CLUEMINATI 4.0",
    accent: "purple",
    registrationUrl: "https://gravitas.vit.ac.in/events/0615fb4d-78b0-4a7c-bc52-ba4cccee2ee6",
    landingPageUrl: "https://gravitas.codechefvit.com/",
    dates: "Gravitas '26",
    location: "VIT Vellore",
    logoType: "clueminati",
    imageUrl: "/events/clueminati.png",
  },
  {
    id: "cookoff-2026",
    title: "CookOff 11",
    tagline: "Largest Competitive Coding Contest",
    description: "Test your algorithmic problem solving skills against top coders. Win prizes, certificates, and glory at Gravitas !",
    badge: "CookOff 11",
    accent: "purple",
    registrationUrl: "https://gravitas.vit.ac.in/events/0629102b-cc5f-4992-8921-2e55df1cb2f8",
    landingPageUrl: "https://gravitas.codechefvit.com/",
    dates: "Gravitas '26",
    location: "VIT Vellore",
    logoType: "cookoff",
    imageUrl: "/events/cookoff.jpg",
  },
];

/**
 * Always pick 100% randomly between available events on every load.
 */
export function getSubjectEvent(_subjectKey?: string | null): EventData {
  const randomIndex = Math.floor(Math.random() * EVENTS.length);
  return EVENTS[randomIndex]!;
}
