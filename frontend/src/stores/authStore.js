import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '../lib/logger';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) => {
        logger.auth.login(user);

        set({
          user,
          token,
          isAuthenticated: Boolean(user && token),
        });
      },

      setUserOnly: (user) => {
        set({
          user,
          isAuthenticated: Boolean(user),
        });
      },

      setToken: (token) => {
        set({
          token,
          isAuthenticated: Boolean(token),
        });
      },

      logout: () => {
        logger.auth.logout();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'kisan-connect-auth',

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);