import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelIcon from "@mui/icons-material/Gavel";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBetCards } from "../hooks/useBetCards";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import ResolveBetDialog from "../components/bet/ResolveBetDialog";
import { getCardBets } from "../api/bets";
import type { BetCardOut } from "../types";

function statusColor(status: BetCardOut["status"]): "warning" | "default" | "success" {
  if (status === "open") return "warning";
  if (status === "closed") return "default";
  return "success";
}

function CardBetsList({ cardId }: { cardId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["bets", "card", cardId],
    queryFn: () => getCardBets(cardId),
  });

  if (isLoading) return <CircularProgress size={16} sx={{ m: 1 }} />;
  if (!data || data.length === 0)
    return <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>No bets yet.</Typography>;

  return (
    <Stack spacing={0.25} sx={{ mt: 1 }}>
      {data.map((b, i) => (
        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{b.username}</Typography>
            <Chip
              label={b.choice.toUpperCase()}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.65rem",
                bgcolor: b.choice === "yes" ? "rgba(38,198,218,0.15)" : "rgba(239,83,80,0.12)",
                color: b.choice === "yes" ? "secondary.dark" : "error.main",
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {b.amount} pts{b.payout !== null ? ` → ${b.payout} pts` : ""}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default function AdminPage() {
  const { data: cards, isLoading: cardsLoading } = useBetCards();
  const { data: users, isLoading: usersLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [resolving, setResolving] = useState<BetCardOut | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedBets, setExpandedBets] = useState<string | null>(null);

  const unresolved = cards?.filter((c) => c.status !== "resolved") ?? [];

  if (cardsLoading || usersLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto" }}>
      {/* ── Resolve Bets ── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Admin — Resolve Bets
      </Typography>

      {unresolved.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          All bet cards are resolved.
        </Typography>
      ) : (
        <Stack spacing={1.5} divider={<Divider />}>
          {unresolved.map((card) => (
            <Paper
              key={card.id}
              elevation={0}
              sx={{ p: 2, border: "1px solid rgba(33,150,243,0.12)" }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {card.title}
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Chip
                      label={card.status.toUpperCase()}
                      color={statusColor(card.status)}
                      size="small"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Pool: {card.total_pool} pts
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    endIcon={expandedBets === card.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setExpandedBets(expandedBets === card.id ? null : card.id)}
                    sx={{ borderRadius: 3, fontSize: "0.7rem", color: "text.secondary" }}
                  >
                    Bets
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    startIcon={<GavelIcon />}
                    onClick={() => setResolving(card)}
                    sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                  >
                    Resolve
                  </Button>
                </Stack>
              </Stack>
              <Collapse in={expandedBets === card.id}>
                <CardBetsList cardId={card.id} />
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ── Manage Users ── */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Manage Users
      </Typography>

      {!users || users.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No users found.
        </Typography>
      ) : (
        <Stack spacing={1} divider={<Divider />}>
          {users.map((u) => (
            <Stack
              key={u.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: 0.75 }}
            >
              <Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {u.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {u.balance} pts
                </Typography>
              </Stack>

              {confirmDelete === u.id ? (
                <Stack direction="row" spacing={0.75}>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    sx={{ borderRadius: 3 }}
                    disabled={deleteUser.isPending}
                    onClick={() => {
                      deleteUser.mutate(u.id, { onSuccess: () => setConfirmDelete(null) });
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="small"
                    sx={{ borderRadius: 3 }}
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              ) : (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: 3 }}
                  onClick={() => setConfirmDelete(u.id)}
                >
                  Delete
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      )}

      {resolving && (
        <ResolveBetDialog
          open
          cardId={resolving.id}
          cardTitle={resolving.title}
          onClose={() => setResolving(null)}
        />
      )}
    </Box>
  );
}
