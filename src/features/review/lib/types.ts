export type Companion = "family" | "friends" | "couple" | "solo" | "work";

export const companionLabels: Record<Companion, string> = {
  family: "Gia đình",
  friends: "Bạn bè",
  couple: "Cặp đôi",
  solo: "Một mình",
  work: "Công tác",
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  placeSlug: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  photos?: string[]; // data URLs (≤ 3 in Phase 1)
  companion?: Companion;
  visitedAt?: string; // "YYYY-MM" month-year
  authorName: string;
  createdAt: number; // epoch ms
  status: ReviewStatus;
}

export type ReviewSort = "newest" | "highest" | "lowest" | "photos";
