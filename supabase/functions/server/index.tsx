import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to get UTC date key (YYYY-MM-DD)
const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

// --- HANDLER FOR AUTO-PUNCH ---
const handleAutoPunch = async (c: any) => {
  const userId = c.req.param("userId");
  const key = `user:${userId}:timebot-data`;
  const dateKey = getTodayKey();
  const nowIso = new Date().toISOString();

  try {
    let userData = await kv.get(key) || { entries: {}, adjustments: {} };
    let entries = userData.entries || {};
    let entry = entries[dateKey] || { date: dateKey, arrival: null, departure: null };

    let action = "";

    if (!entry.arrival) {
      entry.arrival = nowIso;
      action = "arrival_recorded";
    } else if (!entry.departure) {
      entry.departure = nowIso;
      action = "departure_recorded";
    } else {
      action = "already_completed";
    }

    entries[dateKey] = entry;
    userData.entries = entries;

    await kv.set(key, userData);

    console.log(`[AUTO-PUNCH SUCCESS] ${userId} | ${action} | ${nowIso}`);

    return c.json({ 
      success: true, 
      action, 
      time: nowIso, 
      date: dateKey,
      details: entry 
    });
  } catch (error) {
    console.error(`[AUTO-PUNCH ERROR] ${userId}:`, error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Register routes both with and without prefix to avoid 404 due to function-name nesting
app.get("/auto-punch/:userId", handleAutoPunch);
app.get("/make-server-5fca8b67/auto-punch/:userId", handleAutoPunch);

// Standard Sync routes (also registered both ways)
const handleGetSync = async (c: any) => {
  const userId = c.req.param("userId");
  const data = await kv.get(`user:${userId}:timebot-data`);
  return c.json({ data });
};
app.get("/sync/:userId", handleGetSync);
app.get("/make-server-5fca8b67/sync/:userId", handleGetSync);

const handlePostSync = async (c: any) => {
  const userId = c.req.param("userId");
  const { data } = await c.req.json();
  await kv.set(`user:${userId}:timebot-data`, data);
  return c.json({ success: true });
};
app.post("/sync/:userId", handlePostSync);
app.post("/make-server-5fca8b67/sync/:userId", handlePostSync);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/make-server-5fca8b67/health", (c) => c.json({ status: "ok" }));

Deno.serve(app.fetch);
