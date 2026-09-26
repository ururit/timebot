import { createContext } from 'react';

export interface TimeEntry {
  date: string;
  arrival: string | null;
  departure: string | null;
  manualStatus?: 'vacation' | 'sick' | null;
}

export interface User {
  id: string;
  name: string;
}

export interface UserData {
  entries: Record<string, TimeEntry>;
  adjustments?: Record<string, number>;
}

export interface StoreState {
  currentUser: User | null;
  data: Record<string, UserData>;
}

export interface TimeContextType {
  state: StoreState;
  isReady: boolean;
  isOnline: boolean;
  strictMode: boolean;
  setStrictMode: (v: boolean) => void;
  login: (key: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  recordArrival: () => void;
  recordDeparture: () => void;
  resetToday: () => void;
  updateEntry: (dateKey: string, field: 'arrival' | 'departure', value: string | null) => void;
  setManualStatus: (date: string, status: 'vacation' | 'sick' | null) => void;
  getEntry: (date: string) => TimeEntry | undefined;
  getMonthlyBalance: (year: number, month: number) => number;
  adjustMonthlyBalance: (year: number, month: number, diffMinutes: number) => void;
  getDailyNorm: (date: Date) => number;
}

export const TimeContext = createContext<TimeContextType | null>(null);
