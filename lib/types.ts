export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  iconName: string;
  photoUrl?: string;
  x: number; // Coordinate percentage 0-100
  y: number; // Coordinate percentage 0-100
}

export interface MemoryPolaroid {
  id: string;
  caption: string;
  date: string;
  imageUrl: string;
  note: string;
  rotation: number;
}

export type PolaroidPhoto = MemoryPolaroid;

export interface LoveReason {
  id: string;
  category: 'smile' | 'comfort' | 'heart' | 'future';
  text: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  iconName: string;
  redeemed: boolean;
  redeemedAt?: string;
  passcodeRequired?: boolean;
}

export interface DuoRoast {
  id: string;
  title: string;
  badge: string;
  situation: string;
  verdict: string;
  iconName: string;
  guiltyVotes: number;
  admitted?: boolean;
}

export interface GiftData {
  partnerName: string;
  senderName: string;
  partnerNickname: string;
  anniversaryDate: string; // ISO string
  welcomeGreeting: string;
  loveLetter: {
    title: string;
    content: string;
    writtenDate: string;
    sealColor: string;
  };
  milestones: Milestone[];
  memories: MemoryPolaroid[];
  reasons: LoveReason[];
  roasts?: DuoRoast[];
  coupons?: LoveCoupon[];
  favoriteSongsPrompt?: string;
  updatedAt?: number;
}
