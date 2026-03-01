export interface UserOut {
  id: string;
  username: string;
  is_admin: boolean;
  balance: number;
}

export interface UserBetInfo {
  choice: "yes" | "no";
  amount: number;
}

export interface BetCardOut {
  id: string;
  title: string;
  description: string;
  created_by_username: string;
  closes_at: string;
  resolves_at: string | null;
  status: "open" | "closed" | "resolved";
  outcome: "yes" | "no" | null;
  total_pool: number;
  yes_pool: number;
  no_pool: number;
  user_bet: UserBetInfo | null;
}

export interface BetOut {
  id: string;
  bet_card_id: string;
  bet_card_title: string;
  choice: "yes" | "no";
  amount: number;
  payout: number | null;
  placed_at: string;
  new_balance?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  balance: number;
  total_bets: number;
  won: number;
  win_rate: number;
}

export interface UserStats {
  username: string;
  balance: number;
  total_bets: number;
  won: number;
  lost: number;
  pending: number;
  total_wagered: number;
  total_won: number;
  net_profit: number;
}
