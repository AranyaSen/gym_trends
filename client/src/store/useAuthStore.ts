import { create } from "zustand";
import { UserLoginResponse } from "../services/auth/auth.types";
import { persist } from "zustand/middleware";

type AuthStoreTypes = {
  isAuthenticated: boolean;
  userDetails: UserLoginResponse | null;
  setIsAuthenticated: (data: boolean) => void;
  setUserDetails: (data: UserLoginResponse) => void;
  setLogout: () => void;
};

export const useAuthStore = create<AuthStoreTypes>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userDetails: null,
      setIsAuthenticated: (data: boolean) => set({ isAuthenticated: data }),
      setUserDetails: (data: UserLoginResponse) => set({ userDetails: data }),
      setLogout: () => {
        set({
          isAuthenticated: false,
          userDetails: null,
        });
        localStorage.removeItem("auth-store");
      },
    }),
    { name: "auth-store" },
  ),
);
