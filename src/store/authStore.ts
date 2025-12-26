import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      accessToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: "auth-storage", // 로컬 스토리지에 저장될 이름
      storage: createJSONStorage(() => localStorage), // 저장소 (기본값: localStorage)
    }
  )
);
