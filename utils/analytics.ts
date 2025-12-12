// utils/analytics.ts
import { supabase } from "@/utils/supabaseClient";

const METRIKA_ID = Number(process.env.NEXT_PUBLIC_METRIKA_ID);

// ===== uid cookie =====
function getOrCreateUid(): string {
  if (typeof document === "undefined") return "server";

  const m = document.cookie.match(/(?:^|;\s*)df_uid=([^;]+)/);
  if (m?.[1]) return decodeURIComponent(m[1]);

  const uid =
    (globalThis.crypto?.randomUUID?.() ?? `${Math.random().toString(16).slice(2)}-${Date.now()}`);

  const isHttps = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie =
    `df_uid=${encodeURIComponent(uid)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax` +
    (isHttps ? "; Secure" : "");

  return uid;
}

function getPage(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname + window.location.search;
}

// ===== кеш user_id =====
let cachedUserId: string | null = null;
let authListenerStarted = false;

async function initAuthCacheOnce() {
  if (authListenerStarted) return;
  authListenerStarted = true;

  // initial
  try {
    const { data } = await supabase.auth.getSession();
    cachedUserId = data.session?.user?.id ?? null;
  } catch {
    cachedUserId = null;
  }

  // updates
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUserId = session?.user?.id ?? null;
  });
}

// ===== отправка в ClickHouse через API =====
function sendToCollector(payload: any) {
  try {
    const body = JSON.stringify(payload);

    // sendBeacon наиболее надёжен при закрытии вкладки
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }

    // fallback
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

// ===== публичные функции =====
export async function trackEvent(event: string, params: Record<string, unknown> = {}) {
  await initAuthCacheOnce();

  const uid = getOrCreateUid();
  const page = getPage();

  // 1) Метрика
  if (typeof window !== "undefined" && typeof (window as any).ym === "function" && METRIKA_ID) {
    (window as any).ym(METRIKA_ID, "reachGoal", event, { ...params, page });
  }

  // 2) ClickHouse (через серверный коллектор)
  sendToCollector({
    event,
    page,
    uid,
    user_id: cachedUserId, // null для гостей
    params,
  });
}

export function trackPageView(url: string) {
  if (typeof window !== "undefined" && typeof (window as any).ym === "function" && METRIKA_ID) {
    (window as any).ym(METRIKA_ID, "hit", url);
  }
  void trackEvent("page_view", { url });
}
