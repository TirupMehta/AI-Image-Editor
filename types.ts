export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type EditMode = 'crop' | 'magic-expand' | null;

export interface Session {
  id: number;
  timestamp: number;
  userImage: string;
  originalImage: string;
  editedImage: string | null;
  prompt: string;
  status: AppStatus;
  thumbnail: string;
  isExtended: boolean;
}