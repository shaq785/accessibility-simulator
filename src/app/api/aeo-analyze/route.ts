import { NextRequest, NextResponse } from "next/server";
import { analyzeAeo } from "@/lib/aeo/analyze";

const FETCH_TIMEOUT_MS = 8000;

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return true;
  } catch {
    return false;
  }
}

/** Block localhost, loopback, and private IP ranges to prevent SSRF. */
function isUrlBlockedForSsrf(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
    if (hostname.endsWith(".localhost")) return true;

    // Block private IPv4 ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b, c] = ipv4Match.map(Number);
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 127) return true;
    }

    // Block link-local and private IPv6
    if (hostname.startsWith("fe80:") || hostname.startsWith("fc") || hostname.startsWith("fd")) return true;

    return false;
  } catch {
    return true;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AEO-Scanner/1.0 (Answer Engine Optimization checker)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urlFromBody = typeof body?.url === "string" ? body.url.trim() : "";
    const demo = body?.demo === "good" || body?.demo === "bad" ? body.demo : null;

    let url: string;
    if (demo) {
      const origin = request.nextUrl.origin;
      url = `${origin}/aeo/demo/${demo}`;
    } else {
      url = urlFromBody;
    }

    if (!url) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Use http or https only." },
        { status: 400 }
      );
    }

    if (!demo && isUrlBlockedForSsrf(url)) {
      return NextResponse.json(
        { error: "This URL is not allowed (localhost and private networks are blocked)." },
        { status: 400 }
      );
    }

    if (demo) {
      const requestOrigin = request.nextUrl.origin;
      const fetchOrigin = new URL(url).origin;
      if (requestOrigin !== fetchOrigin) {
        return NextResponse.json({ error: "Demo URL must be same origin." }, { status: 400 });
      }
    }

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: HTTP ${response.status}.` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const result = analyzeAeo(html, url);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out. The page took too long to load." },
          { status: 504 }
        );
      }
    }
    console.error("AEO analyze error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing the page." },
      { status: 500 }
    );
  }
}
