import client from "./client";
import type { LeaderboardEntry, UserOut, UserStats } from "../types";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await client.get("/users/leaderboard");
  return Array.isArray(res.data) ? res.data : [];
}

export async function getMyStats(): Promise<UserStats> {
  const res = await client.get("/users/me/stats");
  return res.data;
}

export async function getUsers(): Promise<UserOut[]> {
  const res = await client.get("/users/");
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await client.delete(`/users/${userId}`);
}
