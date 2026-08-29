export type TransferStatusType =
  | "SEEKING_SWAP"
  | "HOST_NEEDED"
  | "VISA_PROCESS"
  | "APPROVED";

export interface UserType {
  id: string;
  intraId: number;
  login: string;
  email?: string | null;
  image?: string | null;
  slackLogin?: string | null;
  originCampus: string;
  targetCampus: string;
  transferStatus: TransferStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  intraId: number;
  login: string;
  email?: string | null;
  image?: string | null;
  originCampus: string;
  targetCampus: string;
  transferStatus: TransferStatusType;
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatusType, string> = {
  SEEKING_SWAP: "Seeking Swap",
  HOST_NEEDED: "Host Needed",
  VISA_PROCESS: "Visa Process",
  APPROVED: "Approved",
};
