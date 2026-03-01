import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usePlaceBet } from "../../hooks/useBetCards";

interface Props {
  open: boolean;
  choice: "yes" | "no" | null;
  cardId: string | null;
  cardTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BetAmountDialog({ open, choice, cardId, cardTitle, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { mutate: placeBet, isPending, error } = usePlaceBet();
  const maxBet = user?.balance ?? 0;
  const [amount, setAmount] = useState(10);

  function handleConfirm() {
    if (!cardId || !choice || amount <= 0) return;
    placeBet(
      { bet_card_id: cardId, choice, amount },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
          setAmount(10);
        },
      }
    );
  }

  function handleClose() {
    onClose();
    setAmount(10);
  }

  const choiceColor = choice === "yes" ? "secondary" : "error";
  const choiceLabel = choice === "yes" ? "YES" : "NO";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack spacing={0.5}>
          <Typography variant="h6">Place Your Bet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
            {cardTitle}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2">You chose:</Typography>
            <Chip
              label={choiceLabel}
              color={choiceColor}
              sx={{ fontWeight: 700, fontSize: "1rem", px: 1 }}
            />
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Bet amount
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Balance: {maxBet} pts
              </Typography>
            </Stack>

            <TextField
              type="number"
              value={amount}
              onChange={(e) => {
                const v = Math.max(1, Math.min(maxBet, Number(e.target.value)));
                setAmount(v);
              }}
              inputProps={{ min: 1, max: maxBet }}
              fullWidth
              size="small"
            />

            <Slider
              value={amount}
              onChange={(_, v) => setAmount(v as number)}
              min={1}
              max={Math.max(maxBet, 1)}
              step={1}
              marks={[
                { value: 1, label: "1" },
                { value: Math.floor(maxBet / 2), label: `${Math.floor(maxBet / 2)}` },
                { value: maxBet, label: `${maxBet}` },
              ]}
              color={choiceColor}
            />
          </Stack>

          {error && (
            <Alert severity="error">
              {(error as any)?.response?.data?.detail || "Failed to place bet"}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Skip
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={choiceColor}
          disabled={isPending || amount <= 0 || amount > maxBet}
        >
          {isPending ? "Betting..." : `Bet ${amount} pts`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
