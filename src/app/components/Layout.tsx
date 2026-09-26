import { useEffect, useState } from "react";
import { NavLink, Outlet, Navigate, useLocation, useSearchParams, useNavigate } from "react-router";
import { useTimeStore } from "@/app/store/TimeStore";
import { Moon, Sun, LogOut, Wifi, WifiOff, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "motion/react";
import { LiquidBackground } from "./LiquidBackground";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const { state, isReady, logout, login, isOnline, strictMode, setStrictMode } = useTimeStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("themePref") === "dark";
  });

  const urlKey = searchParams.get("key");
  const pathMatch = location.pathname.match(/^\/auto-punch\/(.+)$/);
  const pathKey = pathMatch ? pathMatch[1] : null;
  const potentialKey = urlKey || pathKey;

  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(!!potentialKey && !state.currentUser);

  useEffect(() => {
    if (isAutoLoggingIn && potentialKey) {
      login(potentialKey).then(() => {
        setIsAutoLoggingIn(false);
        if (urlKey) {
          searchParams.delete("key");
          navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
        } else if (pathKey) {
          navigate("/auto-punch", { replace: true });
        }
      });
    }
  }, [isAutoLoggingIn, potentialKey, login, navigate, location.pathname, searchParams, urlKey, pathKey]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("themePref", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("themePref", "light");
    }
  }, [isDark]);

  if (!isReady || isAutoLoggingIn) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative">
        <LiquidBackground isDark={isDark} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full border-2 relative overflow-hidden"
            style={{
              borderColor: isDark ? 'rgba(10,132,255,0.3)' : 'rgba(0,122,255,0.3)',
            }}
          >
            <div className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: isDark
                  ? 'conic-gradient(from 0deg, transparent, #0A84FF, transparent)'
                  : 'conic-gradient(from 0deg, transparent, #007AFF, transparent)',
              }}
            />
          </div>
          <span className={cn(
            "text-sm font-medium",
            isDark ? "text-[#98989D]" : "text-[#6E6E73]"
          )}>
            Загружаем...
          </span>
        </motion.div>
      </div>
    );
  }

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  const navBtnBase = cn(
    "p-1.5 sm:p-2 rounded-xl transition-all duration-300 border flex-shrink-0 backdrop-blur-[12px] backdrop-saturate-[1.4]",
    isDark
      ? "bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.1]"
      : "bg-white/[0.55] hover:bg-white/[0.8] border-white/[0.65] shadow-sm"
  );

  return (
    <div className={cn(
      "min-h-[100dvh] transition-colors duration-500 flex flex-col w-full overflow-x-hidden relative",
      isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]"
    )}>
      <LiquidBackground isDark={isDark} />

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.65rem)] transition-all duration-300 app-nav",
        )}
      >
        <div className={cn(
          "container mx-auto px-1 sm:px-4 max-w-4xl min-h-[3.5rem] py-2 flex items-center justify-between gap-1 sm:gap-2 rounded-[22px] border backdrop-blur-[24px] backdrop-saturate-[1.8] shadow-[0_12px_36px_rgba(0,0,0,0.16),inset_0_0.5px_0_rgba(255,255,255,0.16)]",
          isDark
            ? "bg-[rgba(18,18,22,0.72)] border-white/[0.1]"
            : "bg-[rgba(255,255,255,0.58)] border-white/[0.72]"
        )}>
          <div className="flex items-center gap-1 sm:gap-6">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={cn(
                "hidden md:block text-xl font-semibold tracking-tight mr-2",
                isDark ? "text-[#F2F2F7]" : "text-[#1C1C1E]"
              )}
            >
              Учет времени
            </motion.h1>
            <div className={cn(
              "flex gap-1 sm:gap-2 p-1 rounded-2xl border backdrop-blur-[12px] backdrop-saturate-[1.5]",
              isDark ? "bg-black/[0.18] border-white/[0.06]" : "bg-white/[0.32] border-white/[0.55]"
            )}>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? isDark
                        ? "bg-[#0A84FF]/15 text-[#0A84FF] shadow-[inset_0_0_0_0.5px_rgba(10,132,255,0.3)]"
                        : "bg-[#007AFF]/12 text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.25)]"
                      : isDark
                        ? "text-[#98989D] hover:text-[#F2F2F7] hover:bg-white/[0.04]"
                        : "text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-black/[0.04]",
                  )
                }
              >
                Главная
              </NavLink>
              <NavLink
                to="/auto-punch"
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? isDark
                        ? "bg-[#0A84FF]/15 text-[#0A84FF] shadow-[inset_0_0_0_0.5px_rgba(10,132,255,0.3)]"
                        : "bg-[#007AFF]/12 text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.25)]"
                      : isDark
                        ? "text-[#98989D] hover:text-[#F2F2F7] hover:bg-white/[0.04]"
                        : "text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-black/[0.04]",
                  )
                }
              >
                Авто-отметка
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Online indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border flex-shrink-0",
                isOnline
                  ? isDark
                    ? "bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]"
                    : "bg-[#34C759]/12 border-[#34C759]/20 text-[#248A3D]"
                  : isDark
                    ? "bg-[#FF9F0A]/10 border-[#FF9F0A]/20 text-[#FF9F0A]"
                    : "bg-[#FF9500]/12 border-[#B45309]/20 text-[#B45309]"
              )}
            >
              {isOnline
                ? <Wifi className="w-3 h-3" />
                : <WifiOff className="w-3 h-3" />}
              <span className="hidden md:inline">{isOnline ? "Онлайн" : "Офлайн"}</span>
            </motion.div>

            {/* Strict mode toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setStrictMode(!strictMode)}
              title={strictMode ? "Льготный режим включен (-15 мин)" : "Льготный режим выключен"}
              className={cn(
                navBtnBase,
                strictMode
                  ? isDark
                    ? "text-[#30D158] bg-[#30D158]/10"
                    : "text-[#248A3D] bg-[#34C759]/10"
                  : isDark
                    ? "text-[#98989D] opacity-40"
                    : "text-[#6E6E73] opacity-75"
              )}
            >
              <Clock className="w-3 h-3" />
            </motion.button>

            <div className="flex items-center gap-1 sm:gap-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-xl backdrop-blur-[3px] border max-w-[60px] min-[360px]:max-w-[80px] sm:max-w-xs truncate whitespace-nowrap",
                  isDark
                    ? "bg-white/[0.04] border-white/[0.06] text-[#F2F2F7]"
                    : "bg-black/[0.03] border-black/[0.06] text-[#1C1C1E]",
                )}
              >
                {state.currentUser.name}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className={cn(navBtnBase, "text-[#FF453A]")}
                title="Выйти"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDark(!isDark)}
              className={navBtnBase}
              aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
              title={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              {isDark ? (
                <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF9F0A]" />
              ) : (
                <Moon className="w-3 h-3 sm:w-4 sm:h-4 text-[#007AFF]" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col w-full relative z-[1]"
      >
        <Outlet context={{ isDark }} />
      </motion.main>
    </div>
  );
}
