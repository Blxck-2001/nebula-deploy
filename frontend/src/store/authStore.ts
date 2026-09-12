import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('nebula-auth')
          }
        } catch (e) {
          // ignore
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "nebula-auth",
      // Make persist SSR-safe by only accessing localStorage on the client
      getStorage: () => (typeof window !== 'undefined' ? localStorage : undefined) as any,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
