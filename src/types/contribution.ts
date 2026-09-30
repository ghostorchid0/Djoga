export interface Contribution {
  id: string;
  amount: number; // in FCFA (integer)
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type ContributionFilter = 'all' | 'this_week' | 'this_month';
