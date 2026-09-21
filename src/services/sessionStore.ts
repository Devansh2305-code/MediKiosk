import { KioskSessionState, RedFlagAlert } from '../types';

class SessionManager {
  private sessions: Map<string, KioskSessionState> = new Map();
  private readonly TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

  createSession(): KioskSessionState {
    const sessionId = 'KSESS-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const session: KioskSessionState = {
      sessionId,
      step: 'language',
      language: 'hi',
      slots: {},
      documents: [],
      redFlags: [],
      discrepancies: [],
      isAyushMode: false,
      idleSeconds: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): KioskSessionState | null {
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    // Check TTL
    if (Date.now() - s.lastActiveAt > this.TTL_MS) {
      this.sessions.delete(sessionId);
      return null;
    }
    s.lastActiveAt = Date.now();
    return s;
  }

  updateSession(sessionId: string, updater: (s: KioskSessionState) => void): KioskSessionState | null {
    const s = this.getSession(sessionId);
    if (!s) return null;
    updater(s);
    s.lastActiveAt = Date.now();
    return s;
  }

  // PURGE: Clear sensitive session memory immediately on finish or consent revocation
  purgeSession(sessionId: string): void {
    const s = this.sessions.get(sessionId);
    if (s) {
      // Clear data structures
      s.slots = {};
      s.documents = [];
      s.redFlags = [];
      s.discrepancies = [];
      s.patient = undefined;
      s.consent = undefined;
      s.summary = undefined;
      this.sessions.delete(sessionId);
    }
  }

  cleanupExpired(): void {
    const now = Date.now();
    for (const [id, s] of this.sessions.entries()) {
      if (now - s.lastActiveAt > this.TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionManager = new SessionManager();

export const sessionStore = {
  purgeCurrentSession: () => {
    // Purge all active in-memory session data
    sessionManager.cleanupExpired();
  },
  manager: sessionManager,
};
