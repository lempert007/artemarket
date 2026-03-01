import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { useLeaderboard } from "../hooks/useLeaderboard";
import { useAuth } from "../context/AuthContext";

const PRIMARY = "#2196F3";
const SECONDARY = "#26C6DA";
const ME_COLOR = "#FF9800";
const PALETTE = [
  "#2196F3", "#26C6DA", "#AB47BC", "#EF5350",
  "#66BB6A", "#FF7043", "#EC407A", "#7E57C2",
  "#26A69A", "#FFA726",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <ShowChartIcon sx={{ color: PRIMARY, fontSize: 18 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Stack>
  );
}

export default function ChartsPage() {
  const { data: entries, isLoading } = useLeaderboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="text.secondary">No data yet — place some bets!</Typography>
      </Box>
    );
  }

  // Data for chart 1: balance bar (sorted desc, already sorted by backend)
  const balanceData = entries.map((e) => ({
    name: e.username,
    balance: e.balance,
    isMe: e.username === user?.username,
  }));

  // Data for chart 2: activity vs. win rate scatter
  // x = total_bets, y = win_rate %, z = balance (bubble size)
  const scatterData = entries
    .filter((e) => e.total_bets > 0)
    .map((e) => ({
      name: e.username,
      bets: e.total_bets,
      winRate: Math.round(e.win_rate * 100),
      balance: Math.max(e.balance, 50), // floor so tiny balances still show
      isMe: e.username === user?.username,
    }));

  // Data for chart 3: radial win rate per user
  const radialData = entries
    .filter((e) => e.total_bets > 0)
    .map((e, i) => ({
      name: e.username,
      winRate: Math.round(e.win_rate * 100),
      fill: PALETTE[i % PALETTE.length],
      isMe: e.username === user?.username,
    }))
    .sort((a, b) => a.winRate - b.winRate); // recharts draws outermost first

  return (
    <Box sx={{ p: 2, maxWidth: 500, mx: "auto", pb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Stats Graphs
      </Typography>

      {/* ── Chart 1: Balance Race ── */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid rgba(33,150,243,0.12)" }}
      >
        <SectionTitle>Balance Race</SectionTitle>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Current points — you're highlighted in orange
        </Typography>
        <ResponsiveContainer width="100%" height={Math.max(160, balanceData.length * 38)}>
          <BarChart
            data={balanceData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(33,150,243,0.08)" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#78909C" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#546E7A" }}
              width={72}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: number | undefined) => [`${v ?? 0} pts`, "Balance"]}
              contentStyle={{ borderRadius: 8, border: "1px solid rgba(33,150,243,0.2)", fontSize: 12 }}
            />
            <Bar dataKey="balance" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {balanceData.map((d, i) => (
                <Cell key={i} fill={d.isMe ? ME_COLOR : PRIMARY} opacity={d.isMe ? 1 : 0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* ── Chart 2: Volume vs. Accuracy scatter ── */}
      {scatterData.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 3, border: "1px solid rgba(33,150,243,0.12)" }}
        >
          <SectionTitle>Volume vs. Accuracy</SectionTitle>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Activity (# bets) × win rate — bubble size = balance
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(33,150,243,0.08)" />
              <XAxis
                dataKey="bets"
                name="Bets placed"
                type="number"
                label={{ value: "bets placed", position: "insideBottom", offset: -2, fontSize: 11, fill: "#90A4AE" }}
                tick={{ fontSize: 11, fill: "#78909C" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="winRate"
                name="Win rate"
                type="number"
                unit="%"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#78909C" }}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis dataKey="balance" range={[400, 2400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload as typeof scatterData[0];
                  return (
                    <Box
                      sx={{
                        background: "#fff",
                        border: "1px solid rgba(33,150,243,0.2)",
                        borderRadius: 2,
                        p: 1,
                        fontSize: 12,
                      }}
                    >
                      <strong>{d.name}</strong>
                      <br />
                      {d.bets} bets · {d.winRate}% win rate
                      <br />
                      {d.balance} pts balance
                    </Box>
                  );
                }}
              />
              <Scatter data={scatterData} shape="circle">
                {scatterData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.isMe ? ME_COLOR : SECONDARY}
                    fillOpacity={0.8}
                    stroke={d.isMe ? ME_COLOR : SECONDARY}
                    strokeWidth={d.isMe ? 2 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: SECONDARY }} />
              <Typography variant="caption" color="text.secondary">others</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: ME_COLOR }} />
              <Typography variant="caption" color="text.secondary">you</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* ── Chart 3: Win Rate radial ── */}
      {radialData.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 2, border: "1px solid rgba(33,150,243,0.12)" }}
        >
          <SectionTitle>Win Rate Arena</SectionTitle>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Each arc = a player's win rate (longer = higher %)
          </Typography>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="18%"
              outerRadius="90%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="winRate"
                background={{ fill: "rgba(33,150,243,0.05)" }}
                cornerRadius={6}
                label={{
                  position: "insideStart",
                  fill: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  formatter: (v: any) => (v && Number(v) > 0 ? `${v}%` : ""),
                }}
              >
                {radialData.map((d, i) => (
                  <Cell key={i} fill={d.isMe ? ME_COLOR : d.fill} />
                ))}
              </RadialBar>
              <Tooltip
                formatter={(v: number | undefined, _k, props) => [`${v ?? 0}%`, props.payload?.name]}
                contentStyle={{ borderRadius: 8, border: "1px solid rgba(33,150,243,0.2)", fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(name) => (
                  <Typography component="span" variant="caption" color="text.secondary">
                    {name}
                  </Typography>
                )}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
}
