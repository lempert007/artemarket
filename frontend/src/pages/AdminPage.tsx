import GavelIcon from "@mui/icons-material/Gavel";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useBetCards } from "../hooks/useBetCards";
import ResolveBetDialog from "../components/bet/ResolveBetDialog";
import type { BetCardOut } from "../types";

function statusColor(status: BetCardOut["status"]): "warning" | "default" | "success" {
  if (status === "open") return "warning";
  if (status === "closed") return "default";
  return "success";
}

export default function AdminPage() {
  const { data: cards, isLoading } = useBetCards();
  const [resolving, setResolving] = useState<BetCardOut | null>(null);

  const unresolved = cards?.filter((c) => c.status !== "resolved") ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto" }}>
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
            </Paper>
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
