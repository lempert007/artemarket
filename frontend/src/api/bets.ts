import client from "./client";
import type { BetOut, CardBetEntry } from "../types";

export async function placeBet(data: {
  bet_card_id: string;
  choice: "yes" | "no";
  amount: number;
}): Promise<BetOut> {
  const res = await client.post("/bets/", data);
  return res.data;
}

export async function getMyBets(skip = 0, limit = 20): Promise<BetOut[]> {
  const res = await client.get("/bets/my", { params: { skip, limit } });
  return res.data;
}

export async function getCardBets(cardId: string): Promise<CardBetEntry[]> {
  const res = await client.get(`/bets/card/${cardId}`);
  return res.data;
}
