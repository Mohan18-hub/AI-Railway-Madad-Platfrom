import { create } from "zustand";

// ── Auth Store ─────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    role: string;
    phone?: string;
    email?: string;
  } | null;
  accessToken: string | null;
  setAuth: (user: AuthState["user"], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("access_token"),
  user: null,
  accessToken: localStorage.getItem("access_token"),
  setAuth: (user, token) => {
    localStorage.setItem("access_token", token);
    set({ isAuthenticated: true, user, accessToken: token });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ isAuthenticated: false, user: null, accessToken: null });
  },
}));

// ── UI Store ───────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));
