import { useQuery } from "@tanstack/react-query";
import { getMyBets } from "../api/bets";
import { getMyStats } from "../api/users";

export function useMyStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getMyStats,
    staleTime: 30_000,
  });
}

export function useMyBets(skip = 0, limit = 20) {
  return useQuery({
    queryKey: ["bets", "my", skip, limit],
    queryFn: () => getMyBets(skip, limit),
  });
}
