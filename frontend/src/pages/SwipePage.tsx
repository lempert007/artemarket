import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useSwipeQueue } from "../hooks/useBetCards";
import { useAuth } from "../context/AuthContext";
import BetCardStack from "../components/bet/BetCardStack";

export default function SwipePage() {
  const { data: cards, isLoading, error } = useSwipeQueue();
  const { isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="error">Failed to load bets</Typography>
      </Box>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 400 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: "primary.light" }} />
        <Typography variant="h6" color="text.secondary">
          You're all caught up!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new bet using the + button, or check back later.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 4,
        pb: 2,
        minHeight: 500,
      }}
    >
      <BetCardStack cards={cards} isAdmin={isAdmin} />
    </Box>
  );
}
