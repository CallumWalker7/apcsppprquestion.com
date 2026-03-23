import { Session } from "@/types";

const SESSIONS_KEY = "ap_csp_sessions";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
}

export function getSession(id: string): Session | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
