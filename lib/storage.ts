import { SessionData } from './data';

const STORAGE_KEY = 'food-picker-sessions';

export function getSessions(): { [key: string]: SessionData } {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function getSession(sessionId: string): SessionData | null {
  const sessions = getSessions();
  return sessions[sessionId] || null;
}

export function saveSession(session: SessionData): void {
  const sessions = getSessions();
  sessions[session.id] = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createSession(date: string): SessionData {
  const sessionId = `${date}-${Date.now()}`;
  const session: SessionData = {
    id: sessionId,
    date,
    person1: null,
    person2: null,
    result: null,
  };
  saveSession(session);
  return session;
}

export function getSessionByDate(date: string): SessionData | null {
  const sessions = getSessions();
  // Find the most recent session for this date
  const dateSessions = Object.values(sessions)
    .filter(s => s.date === date)
    .sort((a, b) => {
      const aTime = parseInt(a.id.split('-').pop() || '0');
      const bTime = parseInt(b.id.split('-').pop() || '0');
      return bTime - aTime;
    });
  return dateSessions[0] || null;
}

export function findMatches(session: SessionData): string[] {
  if (!session.person1 || !session.person2) return [];
  
  const person1Restaurants = session.person1.restaurants;
  const person2Restaurants = session.person2.restaurants;
  
  return person1Restaurants.filter((r: string) => person2Restaurants.includes(r));
}

export function pickRandom(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}
