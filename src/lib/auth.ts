// src/lib/auth.ts
export type Role = "PROFESSOR" | "ALUNO";

export type AppUser = {
  name: string;
  email: string;
  role: Role;
};

const STORAGE_KEY = "po.user";

export function setCurrentUser(user: AppUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  // compat extra
  localStorage.setItem("role", user.role.toLowerCase());
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("role");
}
