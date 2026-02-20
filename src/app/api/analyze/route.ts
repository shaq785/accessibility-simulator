import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const PAGE_TIMEOUT = 20000;
const FETCH_TIMEOUT = 10000;

// Check if we're in a serverless environment where Puppeteer won't work reliably
const isServerless = !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ============ AXE-CORE ANALYSIS (Primary - Local only) ============

async function analyzeWithAxe(url: string) {
  // Dynamically import puppeteer modules only when needed
  const puppeteer = await import("puppeteer-core");
  const { AxePuppeteer } = await import("@axe-core/puppeteer");
  
  let browser = null;
  
  try {
    browser = await puppeteer.default.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--ignore-certificate-errors",
      ],
      defaultViewport: { width: 1280, height: 720 },
      executablePath: process.env.CHROME_PATH || (
        process.platform === "win32" 
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : "/usr/bin/google-chrome"
      ),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "load",
      timeout: PAGE_TIMEOUT,
    });
    
    await page.waitForSelector("body", { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const axeResults = await new AxePuppeteer(page)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    const summary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      passes: axeResults.passes.length,
    };

    const violations = axeResults.violations.map((violation) => {
      const impact = violation.impact as "minor" | "moderate" | "serious" | "critical";
      summary[impact]++;

      return {
        id: violation.id,
        impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        tags: violation.tags,
        nodes: violation.nodes.slice(0, 5).map((node) => ({
          html: node.html.length > 200 ? node.html.substring(0, 200) + "..." : node.html,
          target: node.target as string[],
          failureSummary: node.failureSummary,
        })),
      };
    });

    violations.sort((a, b) => {
      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      return order[a.impact] - order[b.impact];
    });

    return {
      url,
      summary,
      violations,
      passedRules: axeResults.passes.length,
      testEngine: `axe-core ${axeResults.testEngine.version}`,
      analysisMethod: "axe-core" as const,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ============ CHEERIO ANALYSIS (Fallback) ============

const VAGUE_LINK_PATTERNS = [
  /^click\s*here$/i,
  /^here$/i,
  /^read\s*more$/i,
  /^learn\s*more$/i,
  /^more$/i,
  /^link$/i,
];

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AccessibilitySimulator/1.0",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function analyzeWithCheerio(url: string) {
  const response = await fetchWithTimeout(url, FETCH_TIMEOUT);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Count issues
  let critical = 0;
  let serious = 0;
  let moderate = 0;
  let minor = 0;

  interface CheerioViolation {
    id: string;
    impact: "critical" | "serious" | "moderate" | "minor";
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: { html: string; target: string[]; failureSummary?: string }[];
  }

  const violations: CheerioViolation[] = [];

  // Check images without alt
  const imagesWithoutAlt: string[] = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null) {
      const src = $(el).attr("src") || "";
      imagesWithoutAlt.push(`<img src="${src.substring(0, 50)}...">`);
    }
  });
  if (imagesWithoutAlt.length > 0) {
    serious += 1;
    violations.push({
      id: "image-alt",
      impact: "serious",
      description: "Images must have alternate text",
      help: `${imagesWithoutAlt.length} images missing alt attribute`,
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
      tags: ["wcag2a", "wcag111"],
      nodes: imagesWithoutAlt.slice(0, 3).map(html => ({ html, target: ["img"] })),
    });
  }

  // Check form inputs without labels
  const inputsWithoutLabels: string[] = [];
  $("input, textarea, select").not("[type='hidden'], [type='submit'], [type='button']").each((_, el) => {
    const $el = $(el);
    const id = $el.attr("id");
    const ariaLabel = $el.attr("aria-label");
    const hasLabel = (id && $(`label[for="${id}"]`).length > 0) || $el.closest("label").length > 0 || ariaLabel;
    
    if (!hasLabel) {
      const name = $el.attr("name") || $el.attr("type") || "input";
      inputsWithoutLabels.push(`<input name="${name}">`);
    }
  });
  if (inputsWithoutLabels.length > 0) {
    serious += 1;
    violations.push({
      id: "label",
      impact: "serious",
      description: "Form elements must have labels",
      help: `${inputsWithoutLabels.length} form inputs missing labels`,
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/label",
      tags: ["wcag2a", "wcag412"],
      nodes: inputsWithoutLabels.slice(0, 3).map(html => ({ html, target: ["input"] })),
    });
  }

  // Check heading structure
  const headings: number[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = (el as unknown as { tagName: string }).tagName;
    const level = parseInt(tagName.charAt(1));
    headings.push(level);
  });
  
  const headingIssues: string[] = [];
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      headingIssues.push(`Skipped from h${headings[i-1]} to h${headings[i]}`);
    }
  }
  if (headings.length > 0 && headings[0] !== 1) {
    headingIssues.push(`Page starts with h${headings[0]} instead of h1`);
  }
  if (headingIssues.length > 0) {
    moderate += 1;
    violations.push({
      id: "heading-order",
      impact: "moderate",
      description: "Heading levels should increase by one",
      help: `${headingIssues.length} heading structure issues`,
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/heading-order",
      tags: ["wcag2a", "wcag131"],
      nodes: headingIssues.map(issue => ({ html: issue, target: ["h1-h6"] })),
    });
  }

  // Check buttons without accessible names
  const buttonsWithoutNames: string[] = [];
  $("button, [role='button']").each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const ariaLabel = $el.attr("aria-label");
    if (!text && !ariaLabel) {
      buttonsWithoutNames.push("<button>(no text)</button>");
    }
  });
  if (buttonsWithoutNames.length > 0) {
    serious += 1;
    violations.push({
      id: "button-name",
      impact: "serious",
      description: "Buttons must have discernible text",
      help: `${buttonsWithoutNames.length} buttons without accessible names`,
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/button-name",
      tags: ["wcag2a", "wcag412"],
      nodes: buttonsWithoutNames.slice(0, 3).map(html => ({ html, target: ["button"] })),
    });
  }

  // Check vague link text
  const vagueLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const text = $(el).text().trim();
    if (text && VAGUE_LINK_PATTERNS.some(p => p.test(text))) {
      vagueLinks.push(`<a>"${text}"</a>`);
    }
  });
  if (vagueLinks.length > 0) {
    minor += 1;
    violations.push({
      id: "link-name",
      impact: "minor",
      description: "Links should have descriptive text",
      help: `${vagueLinks.length} links with vague text like "click here"`,
      helpUrl: "https://dequeuniversity.com/rules/axe/4.4/link-name",
      tags: ["wcag2a", "wcag244"],
      nodes: vagueLinks.slice(0, 3).map(html => ({ html, target: ["a"] })),
    });
  }

  // Count passes (rough estimate)
  const totalImages = $("img").length;
  const totalInputs = $("input, textarea, select").not("[type='hidden']").length;
  const totalButtons = $("button, [role='button']").length;
  const totalLinks = $("a[href]").length;
  const passedChecks = 
    (totalImages > 0 && imagesWithoutAlt.length === 0 ? 1 : 0) +
    (totalInputs > 0 && inputsWithoutLabels.length === 0 ? 1 : 0) +
    (headingIssues.length === 0 ? 1 : 0) +
    (totalButtons > 0 && buttonsWithoutNames.length === 0 ? 1 : 0) +
    (totalLinks > 0 && vagueLinks.length === 0 ? 1 : 0);

  return {
    url,
    summary: {
      critical,
      serious,
      moderate,
      minor,
      passes: passedChecks,
    },
    violations,
    passedRules: passedChecks,
    testEngine: "cheerio (lightweight)",
    analysisMethod: "cheerio" as const,
  };
}

// ============ MAIN HANDLER ============

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format. Please provide a valid HTTP or HTTPS URL." },
        { status: 400 }
      );
    }

    // On serverless (Netlify), skip axe-core and use cheerio directly
    if (isServerless) {
      console.log("Serverless environment detected, using cheerio analysis");
      try {
        const result = await analyzeWithCheerio(url);
        return NextResponse.json(result);
      } catch (cheerioError) {
        console.error("Cheerio analysis failed:", cheerioError);
        const errorMessage = cheerioError instanceof Error ? cheerioError.message : "Unknown error";
        return NextResponse.json(
          { error: `Failed to analyze the page: ${errorMessage}` },
          { status: 502 }
        );
      }
    }

    // Local development: Try axe-core first, fallback to cheerio
    try {
      console.log("Attempting axe-core analysis...");
      const result = await analyzeWithAxe(url);
      console.log("axe-core analysis succeeded");
      return NextResponse.json(result);
    } catch (axeError) {
      console.error("axe-core failed, falling back to cheerio:", axeError);
    }

    // Fallback to cheerio
    try {
      console.log("Attempting cheerio analysis...");
      const result = await analyzeWithCheerio(url);
      console.log("cheerio analysis succeeded");
      return NextResponse.json(result);
    } catch (cheerioError) {
      console.error("cheerio also failed:", cheerioError);
      const errorMessage = cheerioError instanceof Error ? cheerioError.message : "Unknown error";
      return NextResponse.json(
        { error: `Failed to analyze the page: ${errorMessage}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
