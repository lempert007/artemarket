import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMe, login as apiLogin } from "../api/auth";
import type { UserOut } from "../types";

interface AuthContextValue {
  user: UserOut | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("artemarket_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("artemarket_token"))
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for 401 responses from the Axios interceptor so we can clear
  // user state and let React Router redirect — no hard page reload needed.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener("artemarket:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("artemarket:unauthorized", handleUnauthorized);
  }, []);

  async function login(username: string) {
    const { access_token, user: u } = await apiLogin(username);
    localStorage.setItem("artemarket_token", access_token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("artemarket_token");
    setUser(null);
  }

  const isAdmin = !!(user?.username === "admin" || user?.is_admin);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
