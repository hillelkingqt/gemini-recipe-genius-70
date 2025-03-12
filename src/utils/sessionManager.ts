
import { UserStatistics } from '@/types/cooking';

class SessionManager {
  private static instance: SessionManager;
  private readonly STATS_KEY = 'user_statistics';
  private readonly SESSION_KEY = 'last_session';

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public saveSession() {
    const currentSession = {
      route: window.location.pathname,
      scroll: window.scrollY,
      timestamp: new Date()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(currentSession));
  }

  public getLastSession() {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  public updateStatistics(stats: Partial<UserStatistics>) {
    const currentStats = this.getStatistics();
    const updatedStats = { ...currentStats, ...stats };
    localStorage.setItem(this.STATS_KEY, JSON.stringify(updatedStats));
  }

  public getStatistics(): UserStatistics {
    const stats = localStorage.getItem(this.STATS_KEY);
    return stats ? JSON.parse(stats) : {
      requestedRecipes: 0,
      completedRecipes: 0,
      favoriteRecipes: [],
      mostCooked: []
    };
  }

  public clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }
}

export const sessionManager = SessionManager.getInstance();

