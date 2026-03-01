import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD = 120;
const ROTATION_MAX = 20;
const VERTICAL_ABORT = 80;

export interface SwipeState {
  isDragging: boolean;
  deltaX: number;
  deltaY: number;
  progress: number; // clamped [-1, 1]
  isFlyingOff: boolean;
  flyDirection: "left" | "right" | null;
}

const initial: SwipeState = {
  isDragging: false,
  deltaX: 0,
  deltaY: 0,
  progress: 0,
  isFlyingOff: false,
  flyDirection: null,
};

export function useSwipe(onSwipe: (direction: "left" | "right") => void) {
  const [state, setState] = useState<SwipeState>(initial);
  const startX = useRef(0);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startY.current = e.clientY;
    setState((s) => ({ ...s, isDragging: true, isFlyingOff: false, flyDirection: null }));
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setState((s) => {
      if (!s.isDragging) return s;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      const progress = Math.max(-1, Math.min(1, dx / SWIPE_THRESHOLD));
      return { ...s, deltaX: dx, deltaY: dy, progress };
    });
  }, []);

  const onPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      setState((s) => {
        if (!s.isDragging) return s;
        const aborted = Math.abs(s.deltaY) > VERTICAL_ABORT;
        if (!aborted && Math.abs(s.deltaX) >= SWIPE_THRESHOLD) {
          const dir: "left" | "right" = s.deltaX < 0 ? "left" : "right";
          // Trigger fly-off, then call onSwipe after animation
          setTimeout(() => {
            onSwipe(dir);
            setState(initial);
          }, 350);
          return { ...s, isDragging: false, isFlyingOff: true, flyDirection: dir };
        }
        // Spring back
        return { ...initial };
      });
    },
    [onSwipe]
  );

  function computeTransform(s: SwipeState): string {
    if (s.isFlyingOff) {
      const flyX = s.flyDirection === "left" ? -window.innerWidth * 1.5 : window.innerWidth * 1.5;
      const rot = s.flyDirection === "left" ? -30 : 30;
      return `translateX(${flyX}px) rotate(${rot}deg)`;
    }
    if (!s.isDragging && s.deltaX === 0) return "translateX(0) rotate(0deg)";
    const rot = (s.deltaX / SWIPE_THRESHOLD) * ROTATION_MAX;
    return `translateX(${s.deltaX}px) translateY(${s.deltaY * 0.15}px) rotate(${rot}deg)`;
  }

  function computeTransition(s: SwipeState): string {
    if (s.isDragging) return "none";
    if (s.isFlyingOff) return "transform 0.35s ease-in";
    return "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  }

  return { state, cardRef, onPointerDown, onPointerMove, onPointerUp, computeTransform, computeTransition };
}
