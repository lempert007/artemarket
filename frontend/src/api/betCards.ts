import client from "./client";
import type { BetCardOut } from "../types";

export async function getSwipeQueue(): Promise<BetCardOut[]> {
  const res = await client.get("/bet-cards/swipe-queue");
  return res.data;
}

export async function getBetCards(status?: string): Promise<BetCardOut[]> {
  const res = await client.get("/bet-cards/", { params: status ? { status } : {} });
  return res.data;
}

export async function createBetCard(data: {
  title: string;
  description: string;
  closes_at: string;
  resolves_at?: string;
}): Promise<BetCardOut> {
  const res = await client.post("/bet-cards/", data);
  return res.data;
}

export async function resolveBetCard(cardId: string, outcome: "yes" | "no"): Promise<BetCardOut> {
  const res = await client.patch(`/bet-cards/${cardId}/resolve`, { outcome });
  return res.data;
}
