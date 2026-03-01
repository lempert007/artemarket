import { Box } from "@mui/material";
import { useState } from "react";
import type { BetCardOut } from "../../types";
import { useSwipe } from "../../hooks/useSwipe";
import BetCard from "./BetCard";
import BetAmountDialog from "./BetAmountDialog";
import ResolveBetDialog from "./ResolveBetDialog";

interface Props {
  cards: BetCardOut[];
  isAdmin?: boolean;
}

export default function BetCardStack({ cards, isAdmin }: Props) {
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<"yes" | "no" | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);

  const visible = cards.filter((c) => !skipped.has(c.id)).slice(0, 3);
  const topCard = visible[0] ?? null;

  function handleSwipe(direction: "left" | "right") {
    if (!topCard) return;
    // left = YES, right = NO
    const choice: "yes" | "no" = direction === "left" ? "yes" : "no";
    setPendingChoice(choice);
    setPendingCardId(topCard.id);
    setDialogOpen(true);
  }

  const { state, onPointerDown, onPointerMove, onPointerUp, computeTransform, computeTransition } =
    useSwipe(handleSwipe);

  function handleDialogClose() {
    // Skip: remove card from visible queue
    if (pendingCardId) setSkipped((s) => new Set([...s, pendingCardId]));
    setDialogOpen(false);
    setPendingChoice(null);
    setPendingCardId(null);
  }

  function handleBetSuccess() {
    if (pendingCardId) setSkipped((s) => new Set([...s, pendingCardId]));
  }

  return (
    <Box sx={{ position: "relative", width: "min(340px, calc(100vw - 32px))", height: 460 }}>
      {visible.map((card, i) => (
        <BetCard
          key={card.id}
          card={card}
          isTop={i === 0}
          swipeState={i === 0 ? state : { isDragging: false, deltaX: 0, deltaY: 0, progress: 0, isFlyingOff: false, flyDirection: null }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          transform={computeTransform(state)}
          transition={computeTransition(state)}
          zIndex={visible.length - i}
          scale={i === 0 ? 1 : 1 - i * 0.04}
          onResolve={isAdmin && i === 0 ? () => setResolveOpen(true) : undefined}
          onSkip={i === 0 ? () => setSkipped((s) => new Set([...s, card.id])) : undefined}
        />
      ))}

      <BetAmountDialog
        open={dialogOpen}
        choice={pendingChoice}
        cardId={pendingCardId}
        cardTitle={topCard?.title ?? ""}
        onClose={handleDialogClose}
        onSuccess={handleBetSuccess}
      />

      {topCard && (
        <ResolveBetDialog
          open={resolveOpen}
          cardId={topCard.id}
          cardTitle={topCard.title}
          onClose={() => setResolveOpen(false)}
        />
      )}
    </Box>
  );
}
