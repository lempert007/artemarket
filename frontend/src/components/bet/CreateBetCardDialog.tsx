import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useCreateBetCard } from "../../hooks/useBetCards";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateBetCardDialog({ open, onClose }: Props) {
  const { mutate: create, isPending, error } = useCreateBetCard();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [resolvesAt, setResolvesAt] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setClosesAt("");
    setResolvesAt("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreate() {
    if (!title.trim() || !description.trim() || !closesAt) return;
    create(
      {
        title: title.trim(),
        description: description.trim(),
        closes_at: new Date(closesAt).toISOString(),
        resolves_at: resolvesAt ? new Date(resolvesAt).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Bet Card</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Closes at"
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="No more bets accepted after this time"
          />
          <TextField
            label="Resolves at (optional)"
            type="datetime-local"
            value={resolvesAt}
            onChange={(e) => setResolvesAt(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="Expected resolution date (display only)"
          />
          {error && (
            <Alert severity="error">
              {(error as any)?.response?.data?.detail || "Failed to create bet card"}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={isPending || !title.trim() || !description.trim() || !closesAt}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
