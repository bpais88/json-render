import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Simple sliding-window rate limiter (in-memory).
//
// On Vercel Serverless each warm instance keeps its own Map, so this won't
// catch abuse that spreads across many cold-starts. For a showcase / demo app
// it's a good first line of defence — it stops rapid scripted abuse within a
// single instance lifetime, and Vercel's built-in DDoS protection covers the
// rest.
//
// Config
// ---------------------------------------------------------------------------
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // per IP per window

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

// Prune stale entries every 5 minutes so the Map doesn't grow unbounded
let lastPrune = Date.now();
function prune() {
  const now = Date.now();
  if (now - lastPrune < 300_000) return;
  lastPrune = now;
  const cutoff = now - WINDOW_MS;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

function isRateLimited(ip: string): { limited: boolean; remaining: number } {
  prune();
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { limited: false, remaining: MAX_REQUESTS - entry.timestamps.length };
}

// ---------------------------------------------------------------------------
// Middleware — only applies to /api/* routes
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { limited, remaining } = isRateLimited(ip);

  if (limited) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
