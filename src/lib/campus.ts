export interface CampusInfo {
  id: number;
  name: string;
  displayName: string;
}

export const MOROCCAN_CAMPUSES: CampusInfo[] = [
  { id: 43, name: "Med", displayName: "Tétouan" },
  { id: 16, name: "Khouribga", displayName: "Khouribga" },
  { id: 21, name: "Ben Guerir", displayName: "Ben Guerir" },
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
    Khouribga: "🇲🇦",
    "Ben Guerir": "🇲🇦",
    Tétouan: "🇲🇦",
    Med: "🇲🇦",
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
