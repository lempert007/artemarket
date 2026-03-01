import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import type { BetCardOut } from "../../types";
import type { SwipeState } from "../../hooks/useSwipe";
import SwipeHint from "./SwipeHint";

interface Props {
  card: BetCardOut;
  swipeState: SwipeState;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  transform: string;
  transition: string;
  zIndex?: number;
  scale?: number;
  isTop: boolean;
  onResolve?: () => void;
  onSkip?: () => void;
}

function OddsBar({ label, pts, pct, color }: { label: string; pts: number; pct: number; color: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="caption" sx={{ fontWeight: 700, color, width: 28 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, bgcolor: `${color}18`, borderRadius: 2, overflow: "hidden", height: 10 }}>
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            bgcolor: color,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color, fontWeight: 600, width: 32, textAlign: "right" }}>
        {Math.round(pct)}%
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ width: 52, textAlign: "right" }}>
        {pts} pts
      </Typography>
    </Stack>
  );
}

export default function BetCard({
  card,
  swipeState,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  transform,
  transition,
  zIndex = 1,
  scale = 1,
  isTop,
  onResolve,
  onSkip,
}: Props) {
  const yesPercent = card.total_pool > 0 ? (card.yes_pool / card.total_pool) * 100 : 50;
  const noPercent = 100 - yesPercent;

  return (
    <Paper
      elevation={4}
      onPointerDown={isTop ? onPointerDown : undefined}
      onPointerMove={isTop ? onPointerMove : undefined}
      onPointerUp={isTop ? onPointerUp : undefined}
      sx={{
        position: "absolute",
        width: "min(340px, calc(100vw - 32px))",
        minHeight: 440,
        cursor: isTop ? (swipeState.isDragging ? "grabbing" : "grab") : "default",
        transform: isTop ? transform : `scale(${scale})`,
        transition: isTop ? transition : "transform 0.3s ease",
        userSelect: "none",
        touchAction: "none",
        zIndex,
        border: "1px solid rgba(33,150,243,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Swipe color overlay */}
      {isTop && swipeState.progress !== 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
            backgroundColor:
              swipeState.progress < 0
                ? `rgba(76, 175, 80, ${Math.abs(swipeState.progress) * 0.45})`
                : `rgba(239, 83, 80, ${swipeState.progress * 0.45})`,
            transition: swipeState.isDragging ? "none" : "background-color 0.3s ease",
          }}
        />
      )}

      {/* YES / NO stamp */}
      {isTop && Math.abs(swipeState.progress) > 0.08 && (
        <Box
          sx={{
            position: "absolute",
            top: 24,
            ...(swipeState.progress < 0 ? { left: 20 } : { right: 20 }),
            border: `3px solid ${swipeState.progress < 0 ? "#4CAF50" : "#EF5350"}`,
            borderRadius: 2,
            px: 1.5,
            py: 0.25,
            transform: `rotate(${swipeState.progress < 0 ? -12 : 12}deg)`,
            opacity: Math.min(1, Math.abs(swipeState.progress) * 2.5),
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: swipeState.progress < 0 ? "#4CAF50" : "#EF5350",
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1.2,
            }}
          >
            {swipeState.progress < 0 ? "YES" : "NO"}
          </Typography>
        </Box>
      )}

      {isTop && <SwipeHint progress={swipeState.progress} />}

      {/* Card header gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #EBF5FB 0%, #FFFFFF 100%)",
          borderBottom: "1px solid rgba(33,150,243,0.1)",
          px: 3,
          pt: 3,
          pb: 2,
          position: "relative",
        }}
      >
        {/* Skip (X) button */}
        {isTop && onSkip && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onSkip(); }}
            onPointerDown={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.disabled",
              "&:hover": { color: "text.secondary", bgcolor: "rgba(0,0,0,0.04)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ lineHeight: 1.3, pr: onSkip ? 4 : 0 }}>
          {card.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
          <PersonOutlineIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {card.created_by_username}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ px: 3, py: 2, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {card.description}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Pool info */}
        <Chip
          label={`Pool: ${card.total_pool} pts`}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        />

        {/* Odds bars */}
        <Stack spacing={0.75}>
          <OddsBar label="YES" pts={card.yes_pool} pct={yesPercent} color="#26C6DA" />
          <OddsBar label="NO" pts={card.no_pool} pct={noPercent} color="#EF5350" />
        </Stack>

        {/* Swipe hint text */}
        {isTop && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: "secondary.light", opacity: 0.7 }}>
              ← Swipe left for YES
            </Typography>
            <Typography variant="caption" sx={{ color: "error.light", opacity: 0.7 }}>
              Swipe right for NO →
            </Typography>
          </Stack>
        )}

        {/* Admin resolve button */}
        {isTop && onResolve && (
          <Button
            variant="outlined"
            size="small"
            color="warning"
            startIcon={<GavelIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            sx={{ borderRadius: 3, alignSelf: "flex-end" }}
          >
            Resolve
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
