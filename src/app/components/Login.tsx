import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTimeStore } from '@/app/store/TimeStore';
import { useNavigate } from 'react-router';
import { KeyRound } from 'lucide-react';
import { LiquidBackground } from './LiquidBackground';

export function Login() {
  const [key, setKey] = useState('');
  const { login, state } = useTimeStore();
  const navigate = useNavigate();

  const isDark = typeof window !== 'undefined' && localStorage.getItem('themePref') === 'dark';

  useEffect(() => {
    if (state.currentUser) {
      navigate('/', { replace: true });
    }
  }, [state.currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      login(key);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 pt-[env(safe-area-inset-top)] relative overflow-hidden">
      <LiquidBackground isDark={isDark} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={isDark
          ? "lg-panel w-full max-w-sm p-8 rounded-[24px]"
          : "lg-panel w-full max-w-sm p-8 rounded-[24px]"
        }
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
            className={isDark
              ? "w-16 h-16 rounded-full bg-[#0A84FF]/10 flex items-center justify-center border border-white/[0.06]"
              : "w-16 h-16 rounded-full bg-[#007AFF]/08 flex items-center justify-center border-2 border-[#dacdcd]"
            }
          >
            <KeyRound className={isDark ? "w-8 h-8 text-[#0A84FF]" : "w-8 h-8 text-[#007AFF]"} />
          </motion.div>

          <div className="text-center">
            <h1 className={isDark ? "text-2xl font-semibold text-[#F2F2F7] tracking-tight" : "text-2xl font-semibold text-[#1C1C1E] tracking-tight"}>
              Вход по ключу
            </h1>
            <p className={isDark ? "text-sm text-[#98989D] mt-2" : "text-sm text-[#8E8E93] mt-2"}>
              Придумайте любой ключ для регистрации и входа
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Секретный ключ..."
              className={isDark
                ? "w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:ring-[0.5px] focus:ring-[#0A84FF]/40 text-[#F2F2F7] placeholder:text-[#98989D] backdrop-blur-[3px] transition-all"
                : "w-full px-4 py-3 rounded-2xl bg-black/[0.03] border border-black/[0.06] focus:outline-none focus:ring-[0.5px] focus:ring-[#007AFF]/40 text-[#1C1C1E] placeholder:text-[#8E8E93] backdrop-blur-[3px] transition-all"
              }
              required
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className={isDark
                ? "w-full py-3 rounded-2xl font-semibold transition-all bg-[#0A84FF] hover:bg-[#0A84FF]/80 text-white shadow-[0_2px_12px_rgba(10,132,255,0.2)]"
                : "w-full py-3 rounded-2xl font-semibold transition-all bg-[#007AFF] hover:bg-[#007AFF]/80 text-white shadow-[0_2px_12px_rgba(0,122,255,0.2)]"
              }
            >
              Войти
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
