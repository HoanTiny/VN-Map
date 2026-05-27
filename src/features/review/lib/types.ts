export type Companion = "family" | "friends" | "couple" | "solo" | "work";

// Display labels live in messages under the `Companion` namespace.
export const companionKeys: Companion[] = ["family", "friends", "couple", "solo", "work"];

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
