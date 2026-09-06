export interface AchievementHolderType {
  id: string;
  intraId: number;
  login: string;
  displayName: string | null;
  imageUrl: string | null;
  campusName: string;
  campusId: number;
  destinationCampusId?: number | null;
  destinationCampusName?: string | null;
  promo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HolderFilters {
  campus?: string;
  promo?: string;
  limit?: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  timestamp: string;
}
