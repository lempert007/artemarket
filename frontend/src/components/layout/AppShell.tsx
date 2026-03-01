import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GavelIcon from "@mui/icons-material/Gavel";
import InsightsIcon from "@mui/icons-material/Insights";
import SwipeIcon from "@mui/icons-material/Swipe";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  Fab,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CreateBetCardDialog from "../bet/CreateBetCardDialog";
import AdminPage from "../../pages/AdminPage";
import ChartsPage from "../../pages/ChartsPage";
import LeaderboardPage from "../../pages/LeaderboardPage";
import StatsPage from "../../pages/StatsPage";
import SwipePage from "../../pages/SwipePage";

export default function AppShell() {
  const { user, logout, isAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top header bar */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: "1px solid rgba(33,150,243,0.12)",
          borderRadius: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: "primary.main" }}>
            Artemarket
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={`${user?.balance ?? 0} pts`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ cursor: "pointer" }}
              onClick={logout}
            >
              {user?.username}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Page content */}
      <Box sx={{ flex: 1, overflow: "auto", pb: 8 }}>
        {tab === 0 && <SwipePage />}
        {tab === 1 && <StatsPage />}
        {tab === 2 && <LeaderboardPage />}
        {tab === 3 && <ChartsPage />}
        {tab === 4 && isAdmin && <AdminPage />}
      </Box>

      {/* FAB */}
      <Fab
        color="primary"
        aria-label="create bet"
        onClick={() => setCreateOpen(true)}
        sx={{
          position: "fixed",
          bottom: 72,
          right: 20,
          boxShadow: "0 4px 16px rgba(33,150,243,0.4)",
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bottom navigation */}
      <Paper
        elevation={0}
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <BottomNavigation value={tab} onChange={(_, v) => setTab(v)}>
          <BottomNavigationAction label="Swipe" icon={<SwipeIcon />} />
          <BottomNavigationAction label="Stats" icon={<BarChartIcon />} />
          <BottomNavigationAction label="Leaderboard" icon={<EmojiEventsIcon />} />
          <BottomNavigationAction label="Graphs" icon={<InsightsIcon />} />
          {isAdmin && <BottomNavigationAction label="Admin" icon={<GavelIcon />} />}
        </BottomNavigation>
      </Paper>

      <CreateBetCardDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
