import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../api/users";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
    staleTime: 60_000,
  });
}
