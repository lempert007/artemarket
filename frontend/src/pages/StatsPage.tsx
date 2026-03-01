import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMyStats, useMyBets } from "../hooks/useUserStats";

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <Paper
      elevation={1}
      sx={{ p: 2, textAlign: "center", border: "1px solid rgba(33,150,243,0.1)", flex: 1 }}
    >
      <Typography variant="h5" sx={{ color: color || "primary.main", fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: bets, isLoading: betsLoading } = useMyBets();

  if (statsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) return null;

  const winRate = stats.won + stats.lost > 0
    ? Math.round((stats.won / (stats.won + stats.lost)) * 100)
    : 0;

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        My Stats
      </Typography>

      {/* Top row: balance + net profit */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <StatBox label="Balance" value={`${stats.balance} pts`} color="primary.main" />
        <StatBox
          label="Net Profit"
          value={`${stats.net_profit >= 0 ? "+" : ""}${stats.net_profit} pts`}
          color={stats.net_profit >= 0 ? "#00BFA5" : "#EF5350"}
        />
      </Stack>

      {/* Bottom row: total / won / win rate */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <StatBox label="Total Bets" value={stats.total_bets} />
        <StatBox label="Won" value={stats.won} color="#00BFA5" />
        <StatBox label="Win Rate" value={`${winRate}%`} color="primary.main" />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        Bet History
      </Typography>

      {betsLoading ? (
        <CircularProgress size={24} />
      ) : !bets || bets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No bets yet. Start swiping!
        </Typography>
      ) : (
        <Stack spacing={1}>
          {bets.map((bet, i) => {
            const isPending = bet.payout === null || bet.payout === undefined;
            const isWon = !isPending && bet.payout! > 0;

            return (
              <Paper
                key={bet.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: "1px solid rgba(33,150,243,0.1)",
                  backgroundColor: i % 2 === 0 ? "#F0F8FF" : "#FFFFFF",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.25} sx={{ flex: 1, mr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {bet.bet_card_title}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Chip
                        label={bet.choice.toUpperCase()}
                        size="small"
                        color={bet.choice === "yes" ? "secondary" : "error"}
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {bet.amount} pts
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack alignItems="flex-end" spacing={0.25}>
                    {isPending ? (
                      <HourglassEmptyIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    ) : isWon ? (
                      <>
                        <CheckIcon sx={{ fontSize: 18, color: "success.main" }} />
                        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                          +{bet.payout} pts
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CloseIcon sx={{ fontSize: 18, color: "error.main" }} />
                        <Typography variant="caption" color="error.main">
                          -{bet.amount} pts
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
