import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBetCard, getBetCards, getSwipeQueue, resolveBetCard } from "../api/betCards";
import { placeBet } from "../api/bets";

export function useSwipeQueue() {
  return useQuery({
    queryKey: ["bet-cards", "swipe-queue"],
    queryFn: getSwipeQueue,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useBetCards(status?: string) {
  return useQuery({
    queryKey: ["bet-cards", { status }],
    queryFn: () => getBetCards(status),
  });
}

export function usePlaceBet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: placeBet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bet-cards", "swipe-queue"] });
      // qc.invalidateQueries({ queryKey: ["auth", "me"] });
      qc.invalidateQueries({ queryKey: ["bets", "my"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useCreateBetCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBetCard,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bet-cards"] });
    },
  });
}

export function useResolveBetCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, outcome }: { cardId: string; outcome: "yes" | "no" | "cancel" }) =>
      resolveBetCard(cardId, outcome),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bet-cards"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
