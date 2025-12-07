import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api, { type ApiResponse } from '../api/client';

interface User {
  id: number;
  login_id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (loginId: string, password: string) => {
        try {
          const response = await api.post<ApiResponse<LoginResponse>>('/portal/login', {
            login_id: loginId,
            password: password,
          });

          const { token, user } = response.data.data;

          set({
            isAuthenticated: true,
            user: {
              ...user,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`,
            },
            token,
          });

          // Token is automatically persisted by zustand/persist, but we can also set it to localStorage explicitly if needed for other libs
          localStorage.setItem('auth_token', token);

        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth_token');
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
);
