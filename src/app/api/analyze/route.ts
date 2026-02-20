import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { AxePuppeteer } from "@axe-core/puppeteer";

const PAGE_TIMEOUT = 30000; // 30 seconds for page load
const AXE_TIMEOUT = 15000; // 15 seconds for axe analysis

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let browser = null;

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

    // Configure for serverless (Netlify) or local development
    const isProduction = process.env.NODE_ENV === "production";
    
    browser = await puppeteer.launch({
      args: isProduction ? chromium.args : [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--ignore-certificate-errors",
        "--disable-web-security",
        "--allow-running-insecure-content",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProduction 
        ? await chromium.executablePath()
        : process.env.CHROME_PATH || (
            process.platform === "win32" 
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "darwin"
                ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
                : "/usr/bin/google-chrome"
          ),
      headless: isProduction ? chromium.headless : true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1280, height: 720 });

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: PAGE_TIMEOUT,
      });
      
      // Wait a bit for dynamic content
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Page load error:", errorMessage);
      
      if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
        return NextResponse.json(
          { error: "Page took too long to load. Please try again or check if the site is accessible." },
          { status: 408 }
        );
      }
      if (errorMessage.includes("net::ERR_NAME_NOT_RESOLVED")) {
        return NextResponse.json(
          { error: "Could not resolve the domain name. Please check the URL." },
          { status: 502 }
        );
      }
      if (errorMessage.includes("net::ERR_CONNECTION_REFUSED")) {
        return NextResponse.json(
          { error: "Connection refused by the server. The site may be down." },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: `Failed to load the page: ${errorMessage.substring(0, 100)}` },
        { status: 502 }
      );
    }

    let axeResults;
    try {
      axeResults = await new AxePuppeteer(page)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
    } catch {
      return NextResponse.json(
        { error: "Failed to analyze the page. The page may have security restrictions." },
        { status: 500 }
      );
    }

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

    const result = {
      url,
      summary,
      violations,
      passedRules: axeResults.passes.length,
      testEngine: `axe-core ${axeResults.testEngine.version}`,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
