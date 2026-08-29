export const MOROCCAN_CAMPUSES = ["Khouribga", "Ben Guerir", "Med"] as const;

export type MoroccanCampus = (typeof MOROCCAN_CAMPUSES)[number];

export const CAMPUS_FLAGS: Record<string, string> = {
  Paris: "🇫🇷",
  London: "🇬🇧",
  "Abu Dhabi": "🇦🇪",
  Lisbon: "🇵🇹",
  Berlin: "🇩🇪",
  Barcelona: "🇪🇸",
  Amsterdam: "🇳🇱",
  Helsinki: "🇫🇮",
  Tokyo: "🇯🇵",
  Seoul: "🇰🇷",
  "San Francisco": "🇺🇸",
  "New York": "🇺🇸",
  Toronto: "🇨🇦",
  Montreal: "🇨🇦",
  "São Paulo": "🇧🇷",
  Mumbai: "🇮🇳",
  Singapore: "🇸🇬",
  Shanghai: "🇨🇳",
  Beijing: "🇨🇳",
  Jerusalem: "🇮🇱",
  Cairo: "🇪🇬",
  Amman: "🇯🇴",
  Casablanca: "🇲🇦",
  Lausanne: "🇨🇭",
  Milan: "🇮🇹",
  Warsaw: "🇵🇱",
  Prague: "🇨🇿",
  Lyon: "🇫🇷",
  Brussels: "🇧🇪",
  Madrid: "🇪🇸",
  Cologne: "🇩🇪",
  Munich: "🇩🇪",
  Vienna: "🇦🇹",
  Oslo: "🇳🇴",
  Stockholm: "🇸🇪",
  Copenhagen: "🇩🇰",
  Dublin: "🇮🇪",
  Bucharest: "🇷🇴",
  Budapest: "🇭🇺",
  Ljubljana: "🇸🇮",
  Malaga: "🇪🇸",
};

export const CAMPUSES = Object.keys(CAMPUS_FLAGS).sort();

export function detectOriginCampus(
  campusUsers: Array<{ campus?: { name?: string } }>
): MoroccanCampus | "Unknown" {
  const campusNames = campusUsers
    .map((cu) => cu.campus?.name)
    .filter(Boolean);

  for (const name of campusNames) {
    if (name === "Khouribga") return "Khouribga";
    if (name === "Ben Guerir") return "Ben Guerir";
    if (name === "Med") return "Med";
  }

  return "Unknown";
}

export function getCampusFlag(campusName: string): string {
  return CAMPUS_FLAGS[campusName] || "🌍";
}

export function getOriginCampusColor(campus: string): string {
  switch (campus) {
    case "Khouribga":
      return "text-neon-cyan";
    case "Ben Guerir":
      return "text-neon-purple";
    case "Med":
      return "text-neon-green";
    default:
      return "text-white/60";
  }
}
