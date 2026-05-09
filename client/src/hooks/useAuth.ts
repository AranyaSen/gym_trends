import { useCallback, useMemo, useSyncExternalStore } from "react";
import { STORAGE_TOKEN_KEY } from "../constants/routes";

type Role = "ADMIN" | "TRAINER" | "MEMBER";

export type AuthUser = {
  id: string;
  role: Role;
  gymId: string | null;
};

function parseJwt(token: string): AuthUser | null {
  try {
    const p = token.split(".")[1];
    if (!p) return null;
    const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const body = JSON.parse(json) as {
      sub: string;
      role: Role;
      gymId: string | null;
    };
    return { id: body.sub, role: body.role, gymId: body.gymId };
  } catch {
    return null;
  }
}

function read(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((l) => l());
}

export function getToken() {
  return read();
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(STORAGE_TOKEN_KEY, token);
  else localStorage.removeItem(STORAGE_TOKEN_KEY);
  emit();
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, read, read);
  const user = useMemo(() => (token ? parseJwt(token) : null), [token]);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return { token, user, logout, setToken };
}
