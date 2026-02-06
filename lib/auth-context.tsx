"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiFetch } from "./api";

export interface AuthUser {
  id: number;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  shopCode?: string;
  shopName?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (
    username: string,
    password: string,
    shopCode?: string
  ) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "inv_token";
const USER_KEY = "inv_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      const storedUser = sessionStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setState({
          token: storedToken,
          user: JSON.parse(storedUser),
          isLoading: false,
        });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string, shopCode?: string) => {
      const body: Record<string, string> = { username, password };
      if (shopCode) body.shopCode = shopCode;

      const res = await apiFetch<{
        success: boolean;
        data: { user: AuthUser; token: string };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { user, token } = res.data;
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      setState({ user, token, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const isSuperAdmin = state.user?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
