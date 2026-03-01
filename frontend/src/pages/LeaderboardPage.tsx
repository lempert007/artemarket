import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Avatar, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useAuth } from "../context/AuthContext";

function rankColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "transparent";
}

function rankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}`;
}

export default function LeaderboardPage() {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="text.secondary">No players yet</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <EmojiEventsIcon sx={{ color: "#FFD700" }} />
        <Typography variant="h6">Leaderboard</Typography>
      </Stack>

      <Stack spacing={1}>
        {entries.map((entry, i) => {
          const isMe = entry.username === user?.username;
          const bg = i % 2 === 0 ? "#F0F8FF" : "#FFFFFF";

          return (
            <Paper
              key={entry.username}
              elevation={isMe ? 3 : 0}
              sx={{
                p: 1.5,
                border: isMe ? "2px solid" : "1px solid rgba(33,150,243,0.1)",
                borderColor: isMe ? "primary.main" : "rgba(33,150,243,0.1)",
                backgroundColor: bg,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {/* Rank */}
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor:
                      entry.rank <= 3 ? rankColor(entry.rank) : "rgba(33,150,243,0.1)",
                    color: entry.rank <= 3 ? "#fff" : "text.secondary",
                    fontSize: entry.rank <= 3 ? "1.1rem" : "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {rankEmoji(entry.rank)}
                </Avatar>

                {/* Username */}
                <Stack sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: isMe ? 700 : 500 }}>
                      {entry.username}
                    </Typography>
                    {isMe && (
                      <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                        (you)
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {entry.total_bets} bets · {Math.round(entry.win_rate * 100)}% win rate
                  </Typography>
                </Stack>

                {/* Balance */}
                <Stack alignItems="flex-end">
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "primary.dark", fontWeight: 700, lineHeight: 1 }}
                  >
                    {entry.balance}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    pts
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
