import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// In-memory rate limiter — per user ID (auth) or IP (guest)
// ---------------------------------------------------------------------------
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const rateStore = new Map<string, { count: number; resetAt: number }>();

function checkRate(key: string): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  for (const [k, v] of rateStore) if (now > v.resetAt) rateStore.delete(k);

  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, retryAfterSec: 0 };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, retryAfterSec: 0 };
}

// ---------------------------------------------------------------------------
// In-memory query cache — keyed by normalised query string, TTL 6 hours
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const queryCache = new Map<string, { data: unknown; expiresAt: number }>();

function normalizeQuery(q: string) {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCached(q: string): unknown | null {
  const entry = queryCache.get(normalizeQuery(q));
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function setCached(q: string, data: unknown) {
  // Prune expired entries
  for (const [k, v] of queryCache) if (Date.now() > v.expiresAt) queryCache.delete(k);
  queryCache.set(normalizeQuery(q), { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

const SYSTEM_PROMPT = `Bạn là trợ lý gợi ý địa điểm du lịch & ẩm thực Việt Nam.

Nhiệm vụ: Gợi ý 3–5 địa điểm thực tế phù hợp nhất với yêu cầu của người dùng.

Quy tắc:
- Chỉ gợi ý địa điểm thực tế tại Việt Nam (đã tồn tại, có thể tìm trên Google Maps)
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn
- address: địa chỉ ngắn gọn (số nhà, đường, quận — không cần đầy đủ)
- category chỉ dùng một trong: cafe, restaurant, bar, hotel, attraction, market, park, beach, museum
- lat/lng: toạ độ GPS thực tế của địa điểm (độ chính xác đến 4 chữ số thập phân)

Trả về JSON theo định dạng:
{
  "message": "câu dẫn ngắn (1-2 câu)",
  "suggestions": [
    {
      "name": "Tên địa điểm",
      "province": "Tỉnh/Thành phố",
      "category": "cafe",
      "address": "địa chỉ ngắn",
      "reason": "lý do ngắn gọn 1 câu",
      "lat": 21.0285,
      "lng": 105.8542
    }
  ]
}

Chỉ trả về JSON thuần túy, không markdown, không text ngoài JSON.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY chưa được cấu hình" }, { status: 500 });
  }

  // Rate limit key: user ID (auth) or IP (guest)
  let rateKey: string;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      rateKey = user ? `uid:${user.id}` : `ip:${req.headers.get("x-forwarded-for") ?? "unknown"}`;
    } catch {
      rateKey = `ip:${req.headers.get("x-forwarded-for") ?? "unknown"}`;
    }
  } else {
    rateKey = `ip:${req.headers.get("x-forwarded-for") ?? "unknown"}`;
  }

  const rate = checkRate(rateKey);
  if (!rate.allowed) {
    return Response.json(
      { error: `Bạn đã gửi quá nhiều yêu cầu. Thử lại sau ${Math.ceil(rate.retryAfterSec / 60)} phút.` },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const { query } = await req.json() as { query: string };

  if (!query?.trim()) {
    return Response.json({ error: "Thiếu query" }, { status: 400 });
  }
  if (query.trim().length > 150) {
    return Response.json({ error: "Câu hỏi quá dài, tối đa 150 ký tự." }, { status: 400 });
  }

  // Return cached result if available (saves quota + latency)
  const cached = getCached(query);
  if (cached) return Response.json(cached);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  try {
    const result = await model.generateContent(query.trim());
    const raw = result.response.text();
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(text);
    setCached(query, parsed);
    return Response.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ai/suggest]", msg);
    return Response.json(
      { error: "Không thể xử lý yêu cầu, thử lại sau.", detail: msg },
      { status: 500 }
    );
  }
}
