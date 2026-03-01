import client from "./client";
import type { LeaderboardEntry, UserStats } from "../types";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await client.get("/users/leaderboard");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getMyStats(): Promise<UserStats> {
  const res = await client.get("/users/me/stats");
  return res.data;
}
