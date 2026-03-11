import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types/api';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminUser | null;
  setSession: (input: { accessToken: string; refreshToken: string; admin: AdminUser }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      setSession: ({ accessToken, refreshToken, admin }) =>
        set({ accessToken, refreshToken, admin }),
      clear: () => set({ accessToken: null, refreshToken: null, admin: null }),
    }),
    { name: 'newadv_admin_auth' },
  ),
);

