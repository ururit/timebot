import { useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { getWorkDayType, getDailyNormConfig } from '../utils/holidays';
import { TimeContext, TimeEntry, StoreState } from './TimeContext';

const SERVER_URL = '/api';
const AUTH_TOKEN = 'tb-rp-2026-sync-secret';

// Локальная дата (YYYY-MM-DD) — ключ дня в записях. НЕ UTC!
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Таймаут для сетевых запросов: если сервер недоступен, не держим UI
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const useTimeStore = () => {
  const ctx = useContext(TimeContext);
  if (!ctx) {
    throw new Error('useTimeStore must be used within TimeProvider');
  }
  return ctx;
};

export function TimeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    const saved = localStorage.getItem('timeTrackerStore_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return { currentUser: null, data: {} };
  });

  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [strictMode, setStrictModeState] = useState(() => {
    return localStorage.getItem('strictMode') !== 'false';
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const setStrictMode = useCallback((v: boolean) => {
    setStrictModeState(v);
    localStorage.setItem('strictMode', v ? 'true' : 'false');
  }, []);

  const syncToCloud = useCallback(async (currentState: StoreState) => {
    if (!currentState.currentUser) return;
    if (!navigator.onLine) return;
    const userId = currentState.currentUser.id;
    const userData = currentState.data[userId];
    if (!userData) return;
    try {
      await fetchWithTimeout(`${SERVER_URL}/sync/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({ data: userData })
      });
    } catch (e) { console.error('syncToCloud:', e); }
  }, []);

  const syncFromCloud = useCallback(async (userId: string) => {
    if (!navigator.onLine) return null;
    try {
      const res = await fetchWithTimeout(`${SERVER_URL}/sync/${userId}`, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setState(prev => ({
            ...prev,
            data: { ...prev.data, [userId]: json.data }
          }));
          return json.data;
        }
      }
    } catch (e) { console.error('syncFromCloud:', e); }
    return null;
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('timeTrackerStore_v2', JSON.stringify(state));
    }
  }, [state, isReady]);

  // Online/offline detection with auto-retry sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const current = stateRef.current;
      if (current.currentUser) {
        syncToCloud(current);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncToCloud]);

  // Поллинг: подтягиваем изменения с сервера, пока пользователь залогинен
  useEffect(() => {
    if (!state.currentUser) return;
    const userId = state.currentUser.id;
    let cancelled = false;
    const poll = async () => {
      if (cancelled || !navigator.onLine) return;
      try {
        const res = await fetchWithTimeout(`${SERVER_URL}/sync/${userId}`, {
          headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });
        if (res.ok) {
          const json = await res.json();
          const newData = json.data;
          if (newData) {
            setState(prev => {
              if (JSON.stringify(prev.data[userId]) === JSON.stringify(newData)) return prev;
              return { ...prev, data: { ...prev.data, [userId]: newData } };
            });
          }
        }
      } catch (e) { /* тихо, сервер может быть недоступен */ }
    };
    const timer = setInterval(poll, 20000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [state.currentUser?.id]);

  // Init: sync from cloud if online, then mark ready. Облако может быть недоступно — приложение работает локально.
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        if (state.currentUser) { await syncFromCloud(state.currentUser.id); }
      } catch (e) { console.error('init sync:', e); }
      if (!cancelled) setIsReady(true);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const login = async (key: string) => {
    setIsReady(false);
    const normalizedKey = key.trim();
    let cloudData: unknown = null;
    try { cloudData = await syncFromCloud(normalizedKey); } catch (e) { console.error('login sync:', e); }
    setState(prev => ({
      ...prev,
      currentUser: { id: normalizedKey, name: normalizedKey },
      data: {
        ...prev.data,
        [normalizedKey]: cloudData || prev.data[normalizedKey] || { entries: {}, adjustments: {} }
      }
    }));
    setIsReady(true);
  };

  const logout = () => { setState(prev => ({ ...prev, currentUser: null })); };

  const updateCurrentUserEntry = (dateKey: string, updateFn: (prev: TimeEntry | undefined) => TimeEntry) => {
    const current = stateRef.current;
    if (!current.currentUser) return;
    const userId = current.currentUser.id;
    const userData = current.data[userId] || { entries: {} };
    const newEntry = updateFn(userData.entries[dateKey]);
    const nextState = {
      ...current,
      data: {
        ...current.data,
        [userId]: {
          ...userData,
          entries: { ...userData.entries, [dateKey]: newEntry }
        }
      }
    };
    setState(nextState);
    syncToCloud(nextState);
  };

  const recordArrival = () => {
    const key = todayKey();
    updateCurrentUserEntry(key, (prev) => ({
      date: key, ...prev, arrival: new Date().toISOString(), departure: null
    }));
  };

  const recordDeparture = () => {
    const key = todayKey();
    updateCurrentUserEntry(key, (prev) => {
      if (!prev || !prev.arrival || prev.departure) return prev || { date: key, arrival: null, departure: null };
      return { ...prev, departure: new Date().toISOString() };
    });
  };

  const resetToday = () => {
    const key = todayKey();
    updateCurrentUserEntry(key, (prev) => ({
      date: key, arrival: null, departure: null, manualStatus: prev?.manualStatus
    }));
  };

  const updateEntry = (dateKey: string, field: 'arrival' | 'departure', value: string | null) => {
    updateCurrentUserEntry(dateKey, (prev) => {
      let finalValue = value;
      if (value && value.includes(':')) {
        const [h, m] = value.split(':');
        const d = new Date(dateKey);
        d.setHours(parseInt(h), parseInt(m), 0, 0);
        finalValue = d.toISOString();
      }
      return { date: dateKey, ...prev, [field]: finalValue } as TimeEntry;
    });
  };

  const setManualStatus = (dateKey: string, status: 'vacation' | 'sick' | null) => {
    updateCurrentUserEntry(dateKey, (prev) => ({
      date: dateKey, arrival: prev?.arrival || null, departure: prev?.departure || null,
      ...prev, manualStatus: status
    }));
  };

  const getMonthlyBalance = (year: number, month: number) => {
    if (!state.currentUser) return 0;
    const userData = state.data[state.currentUser.id];
    if (!userData) return 0;
    let balance = 0;
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    if (userData.adjustments && userData.adjustments[prefix]) {
      balance += userData.adjustments[prefix];
    }
    Object.values(userData.entries).forEach(entry => {
      if (entry.date.startsWith(prefix) && !entry.manualStatus && entry.arrival && entry.departure) {
        const workedMins = (new Date(entry.departure).getTime() - new Date(entry.arrival).getTime()) / 60000;
        // If strictMode is true, the daily norm is reduced by 15 minutes
        const norm = getDailyNormConfig(new Date(entry.date), strictMode);
        balance += (workedMins - norm);
      }
    });
    return Math.round(balance);
  };

  const adjustMonthlyBalance = (year: number, month: number, diffMinutes: number) => {
    const current = stateRef.current;
    if (!current.currentUser) return;
    const userId = current.currentUser.id;
    const userData = current.data[userId];
    if (!userData) return;
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const nextState = {
      ...current,
      data: {
        ...current.data,
        [userId]: {
          ...userData,
          adjustments: { ...(userData.adjustments || {}), [prefix]: (userData.adjustments?.[prefix] || 0) + diffMinutes }
        }
      }
    };
    setState(nextState);
    syncToCloud(nextState);
  };

  const value = {
    state, isReady, isOnline, strictMode, setStrictMode,
    login, logout,
    refresh: async () => { if (state.currentUser) await syncFromCloud(state.currentUser.id); },
    recordArrival, recordDeparture, resetToday, updateEntry, setManualStatus,
    getEntry: (dateKey: string) => state.currentUser ? state.data[state.currentUser.id]?.entries[dateKey] : undefined,
    getMonthlyBalance, adjustMonthlyBalance, getDailyNorm: getDailyNormConfig
  };

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}
