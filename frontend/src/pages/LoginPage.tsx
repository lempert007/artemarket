import HowToVoteOutlinedIcon from "@mui/icons-material/HowToVoteOutlined";
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setError("");
    setLoading(true);
    try {
      await login(username.trim());
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{ width: "100%", maxWidth: 400, overflow: "hidden" }}
      >
        {/* Header strip */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #2196F3 0%, #26C6DA 100%)",
            py: 4,
            px: 3,
            textAlign: "center",
          }}
        >
          <HowToVoteOutlinedIcon sx={{ fontSize: 48, color: "#fff", mb: 1 }} />
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Artemarket
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
            Predict. Bet. Win.
          </Typography>
        </Box>

        {/* Form */}
        <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ p: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" textAlign="center">
            Enter your username to continue
          </Typography>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            fullWidth
            inputProps={{ maxLength: 30 }}
            helperText="Letters, digits, underscore — up to 30 chars"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !username.trim()}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Enter"}
          </Button>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            New users are created automatically with 1000 points
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
