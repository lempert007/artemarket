import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useResolveBetCard } from "../../hooks/useBetCards";

interface Props {
  open: boolean;
  cardId: string;
  cardTitle: string;
  onClose: () => void;
}

export default function ResolveBetDialog({ open, cardId, cardTitle, onClose }: Props) {
  const { mutate: resolve, isPending, error } = useResolveBetCard();
  const [outcome, setOutcome] = useState<"yes" | "no" | "cancel" | null>(null);

  function handleResolve() {
    if (!outcome) return;
    resolve(
      { cardId, outcome },
      { onSuccess: onClose }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Resolve Bet</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            {cardTitle}
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">What was the outcome?</Typography>
            <ToggleButtonGroup
              value={outcome}
              exclusive
              onChange={(_, v) => v && setOutcome(v)}
              fullWidth
            >
              <ToggleButton value="yes" color="secondary">
                YES
              </ToggleButton>
              <ToggleButton value="no" color="error">
                NO
              </ToggleButton>
              <ToggleButton value="cancel" color="warning">
                Refund All
              </ToggleButton>
            </ToggleButtonGroup>
            {outcome === "cancel" && (
              <Typography variant="caption" color="text.secondary">
                Everyone gets their points back. No winners or losers.
              </Typography>
            )}
          </Stack>
          {error && (
            <Alert severity="error">
              {(error as any)?.response?.data?.detail || "Failed to resolve"}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleResolve}
          variant="contained"
          disabled={isPending || !outcome}
        >
          {isPending ? "Resolving..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
