import { Box, Typography } from "@mui/material";

interface Props {
  progress: number; // -1 to 1
}

export default function SwipeHint({ progress }: Props) {
  const yesOpacity = Math.max(0, -progress);
  const noOpacity = Math.max(0, progress);

  return (
    <>
      {/* YES badge — appears on left swipe */}
      <Box
        sx={{
          position: "absolute",
          top: 28,
          left: 24,
          opacity: yesOpacity,
          border: "3px solid",
          borderColor: "secondary.main",
          borderRadius: 2,
          px: 1.5,
          py: 0.25,
          transform: "rotate(-12deg)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "secondary.main", fontWeight: 800, lineHeight: 1 }}
        >
          YES
        </Typography>
      </Box>

      {/* NO badge — appears on right swipe */}
      <Box
        sx={{
          position: "absolute",
          top: 28,
          right: 24,
          opacity: noOpacity,
          border: "3px solid",
          borderColor: "error.main",
          borderRadius: 2,
          px: 1.5,
          py: 0.25,
          transform: "rotate(12deg)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "error.main", fontWeight: 800, lineHeight: 1 }}
        >
          NO
        </Typography>
      </Box>
    </>
  );
}
