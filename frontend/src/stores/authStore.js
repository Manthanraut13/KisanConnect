import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// NOTE: Tokens are kept in memory (Zustand) per project security rules.
// The persist middleware below only stores non-sensitive profile data,
// never the JWT. The token stays only in memory and is restored after
// login / refresh flow.
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      setUserOnly: (user) => set({ user }),
      setToken: (token) =>
        set({ token, isAuthenticated: Boolean(token) }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'kisan-connect-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
