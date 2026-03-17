import type { NextApiRequest, NextApiResponse } from "next";

type Body = {
  event: string;
  page?: string;
  uid?: string;
  user_id?: string | null;
  params?: Record<string, unknown>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const body = req.body as Body;

    if (!body?.event) return res.status(400).json({ ok: false, error: "event_required" });

    console.log("[events] incoming:", body.event, body.params ?? {});

    const row = {
      // важное: ts ставим на сервере
      ts: new Date().toISOString().replace("Z", ""),
      event: body.event,
      page: body.page ?? null,
      uid: body.uid ?? null,
      user_id: body.user_id ?? null,
      params: JSON.stringify(body.params ?? {}),
    };

    const host = process.env.CLICKHOUSE_HOST; // например: https://<fqdn>:8443
    const user = process.env.CLICKHOUSE_USER; // ingest
    const pass = process.env.CLICKHOUSE_PASSWORD;
    const db = process.env.CLICKHOUSE_DB ?? "analytics";
    const table = process.env.CLICKHOUSE_TABLE ?? "events_raw";

    if (!host || !user || !pass) {
      console.error("[events] ClickHouse env missing (CLICKHOUSE_HOST / USER / PASSWORD)");
      return res.status(200).json({ ok: false, error: "clickhouse_env_missing" });
    }

    const query = `INSERT INTO ${db}.${table} FORMAT JSONEachRow`;

    const r = await fetch(`${host}/?query=${encodeURIComponent(query)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${user}:${pass}`).toString("base64"),
      },
      body: JSON.stringify(row) + "\n",
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[events] ClickHouse insert failed:", text.slice(0, 500));
      return res.status(200).json({ ok: false, error: "clickhouse_insert_failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("[events] Unexpected error:", String(e?.message ?? e));
    return res.status(200).json({ ok: false, error: "server_error" });
  }
}
