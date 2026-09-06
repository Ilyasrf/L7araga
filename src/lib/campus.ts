export interface CampusInfo {
  id: number;
  name: string;
  displayName: string;
}

export const MOROCCAN_CAMPUSES: CampusInfo[] = [
  { id: 16, name: "Khouribga", displayName: "Khouribga" },
  { id: 21, name: "Benguerir", displayName: "Benguerir" },
  { id: 55, name: "Tétouan", displayName: "Tétouan" },
  { id: 75, name: "Rabat", displayName: "Rabat" },
];

export const CAMPUS_MAP: Record<number, CampusInfo> = Object.fromEntries(
  MOROCCAN_CAMPUSES.map((c) => [c.id, c])
);

export const CAMPUS_NAMES = MOROCCAN_CAMPUSES.map((c) => c.displayName);

export const CAMPUSES = MOROCCAN_CAMPUSES.map((c) => c.name);

export function detectCampusId(campusName: string): number | null {
  const campus = MOROCCAN_CAMPUSES.find(
    (c) => c.name === campusName || c.displayName === campusName
  );
  return campus?.id ?? null;
}

export function getCampusDisplayName(campusName: string): string {
  const campus = MOROCCAN_CAMPUSES.find(
    (c) => c.name === campusName || c.displayName === campusName
  );
  return campus?.displayName ?? campusName;
}

export function getCampusFlag(campusName: string): string {
  const flags: Record<string, string> = {
    // Morocco
    "Khouribga": "🇲🇦",
    "Benguerir": "🇲🇦",
    "Ben Guerir": "🇲🇦",
    "Tétouan": "🇲🇦",
    "Rabat": "🇲🇦",
    "Med": "🇲🇦",
    
    // France
    "Paris": "🇫🇷",
    "Lyon": "🇫🇷",
    "Mulhouse": "🇫🇷",
    "Nice": "🇫🇷",
    "Angoulême": "🇫🇷",
    "Angouleme": "🇫🇷",
    "Le Havre": "🇫🇷",
    "Perpignan": "🇫🇷",
    
    // Spain
    "Madrid": "🇪🇸",
    "Barcelona": "🇪🇸",
    "Urduliz": "🇪🇸",
    "Malaga": "🇪🇸",
    "Alicante": "🇪🇸",
    "42 Urduliz": "🇪🇸",
    "42 Barcelona": "🇪🇸",
    
    // Germany
    "Heilbronn": "🇩🇪",
    "Wolfsburg": "🇩🇪",
    "Berlin": "🇩🇪",
    
    // Italy
    "Roma": "🇮🇹",
    "Firenze": "🇮🇹",
    "42 Roma Luiss": "🇮🇹",
    
    // Other Europe
    "Vienna": "🇦🇹",
    "Lisboa": "🇵🇹",
    "Porto": "🇵🇹",
    "London": "🇬🇧",
    "Lausanne": "🇨🇭",
    "Prague": "🇨🇿",
    "Warsaw": "🇵🇱",
    "Helsinki": "🇫🇮",
    "Hive Helsinki": "🇫🇮",
    "Amsterdam": "🇳🇱",
    "Codam": "🇳🇱",
    "Brussels": "🇧🇪",
    "Belgium": "🇧🇪",
    "19": "🇧🇪",
    
    // Asia & Middle East
    "Seoul": "🇰🇷",
    "Gyeongsan": "🇰🇷",
    "Tokyo": "🇯🇵",
    "Abu Dhabi": "🇦🇪",
    "Istanbul": "🇹🇷",
    "Kocaeli": "🇹🇷",
    "Kuala Lumpur": "🇲🇾",
    "42 KL": "🇲🇾",
    "Singapore": "🇸🇬",
    "Bangkok": "🇹🇭",
    "Yerevan": "🇦🇲",
    
    // Americas
    "Quebec": "🇨🇦",
    "Rio de Janeiro": "🇧🇷",
    "São Paulo": "🇧🇷",
    
    // Africa / Oceania
    "Luanda": "🇦🇴",
    "Antananarivo": "🇲🇬",
    "Adelaide": "🇦🇺",
  };
  return flags[campusName] || "🌍";
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
