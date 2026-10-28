import handler from "@tanstack/react-start/server-entry";
import { db } from "@/db";
import { llmQuerySets } from "@/db/schema";
import { LlmTrackingService } from "@/server/lib/llmTrackingService";
import { RankTrackingService } from "@/server/features/keywords/services/RankTrackingService";

// Export Workflow classes as named exports
export { SiteAuditWorkflow } from "./server/workflows/SiteAuditWorkflow";

const INTERNAL_CRON_PATH = "/__internal/cron";

async function runDailyAutomation(env: Env) {
  console.log("Running Daily OpenSEO Automation...");

  // 1. LLM Mentions Tracking
  console.log("Phase 1: LLM Mentions Tracking...");
  const allSets = await db.select().from(llmQuerySets);
  for (const set of allSets) {
    try {
      await LlmTrackingService.runLlmScan(set.id);
    } catch (e) {
      console.error(`Failed scheduled scan for LLM Query Set ${set.id}`, e);
    }
  }

  // 2. Rank Tracking
  console.log("Phase 2: Daily Rank Tracking...");
  try {
    await RankTrackingService.trackAllProjectsRankings();
  } catch (e) {
    console.error("Global Rank Tracking CRON failed:", e);
  }

  // Dispatch Discord Alerts if Hook is attached
  const hookUrl = env.DISCORD_WEBHOOK_URL;
  if (hookUrl) {
    const appUrl = env.APP_URL || "http://localhost:3001/";
    try {
      await fetch(hookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🤖 **OpenSEO Daily Alert**\nThe background CRON job just completed scans for LLM Mentions (ChatGPT/Perplexity/Gemini) AND Daily Rank Tracking across all your projects.\nCheck your dashboard to see the latest performance data! \n[Open Tracker](${appUrl})`,
        }),
      });
    } catch (e) {
      console.error("Discord CRON Alert Failed:", e);
    }
  }

  console.log("Daily OpenSEO Automation complete.");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function isBasicAuthorized(request: Request, env: Env) {
  const user = env.BASIC_AUTH_USER;
  const password = env.BASIC_AUTH_PASSWORD;
  if (!user || !password) return true;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice("Basic ".length).trim());
    return timingSafeEqual(decoded, `${user}:${password}`);
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Internal cron trigger, called by the container's scheduler loop.
    if (url.pathname === INTERNAL_CRON_PATH) {
      const secret = env.CRON_SECRET;
      const provided = request.headers.get("x-cron-secret") ?? "";
      if (!secret || !timingSafeEqual(provided, secret)) {
        return new Response("Not found", { status: 404 });
      }
      ctx.waitUntil(runDailyAutomation(env));
      return new Response("Daily automation started", { status: 202 });
    }

    if (!isBasicAuthorized(request, env)) {
      return new Response("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="OpenSEO"' },
      });
    }

    return handler.fetch(request);
  },
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(runDailyAutomation(env));
  },
};
