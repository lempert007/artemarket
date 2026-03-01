import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2196F3", light: "#64B5F6", dark: "#1565C0" },
    secondary: { main: "#26C6DA" },
    success: { main: "#00BFA5" },
    error: { main: "#EF5350" },
    background: { default: "#EBF5FB", paper: "#FFFFFF" },
    text: { primary: "#1A2A3A", secondary: "#5A7A9A" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 24, paddingLeft: 24, paddingRight: 24 },
        contained: { boxShadow: "0 2px 8px rgba(33,150,243,0.25)" },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid rgba(33,150,243,0.12)",
        },
      },
    },
  },
});
