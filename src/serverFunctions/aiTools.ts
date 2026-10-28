import { createServerFn } from "@tanstack/react-start";
import { authenticatedServerFunctionMiddleware } from "@/serverFunctions/middleware";
import { z } from "zod";
import { db } from "@/db";
import { auditPages, savedKeywords } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { isLlmConfigured, runChatCompletion } from "@/server/lib/llm";

export const generateAiAuditFix = createServerFn({ method: "POST" })
  .middleware(authenticatedServerFunctionMiddleware)
  .inputValidator((data: unknown) =>
    z.object({
      auditPageId: z.string(),
      issueType: z.enum(["missing_meta_description", "missing_alt_text", "missing_h1"]),
    }).parse(data)
  )
  .handler(async ({ data: { auditPageId, issueType } }) => {
    const page = await db.query.auditPages.findFirst({
      where: eq(auditPages.id, auditPageId),
    });

    if (!page) return { fix: "", error: "Page not found" };

    let prompt = "";
    if (issueType === "missing_meta_description") {
      prompt = `Write a high-converting, SEO-optimized meta description (under 160 characters) for this webpage: URL: ${page.url}. Title: ${
        page.title || "Unknown"
      }. Headings: ${page.h1Count} H1s. Provide strictly the text for the meta description, no markdown or reasoning.`;
    } else if (issueType === "missing_alt_text") {
      prompt = `Write concise, descriptive, and SEO-friendly alt text for an image found on this webpage: URL: ${page.url}, Title: ${
        page.title || "Unknown"
      }. Provide strictly the alt text alone.`;
    } else if (issueType === "missing_h1") {
      prompt = `Write a catchy, highly relevant H1 SEO heading for this webpage: URL: ${page.url}, Title: ${
        page.title || "Unknown"
      }. Provide strictly the heading text alone.`;
    }

    if (!isLlmConfigured()) {
      return { fix: "", error: "AI features disabled: set LLM_API_KEY" };
    }

    try {
      const text = await runChatCompletion([
        { role: "system", content: "You are an expert technical SEO assistant." },
        { role: "user", content: prompt },
      ]);
      return { fix: text.replace(/"/g, "").trim() };
    } catch (err: any) {
      console.error("AI Generation Error:", err.stack || err);
      return { fix: "", error: `AI Error: ${err.message || String(err)}` };
    }
  });

export const clusterKeywords = createServerFn({ method: "POST" })
  .middleware(authenticatedServerFunctionMiddleware)
  .inputValidator((data: unknown) => z.object({ projectId: z.string() }).parse(data))
  .handler(async ({ data: { projectId } }) => {
    const keywords = await db.query.savedKeywords.findMany({
      where: eq(savedKeywords.projectId, projectId),
    });

    if (!keywords.length) return { success: false, clustersUpdated: 0 };

    const kwList = keywords.map((k) => k.keyword).join(", ");
    const prompt = `Categorize the following search keywords into 4 to 6 thematic clusters based on user search intent or product category. Return ONLY a pure JSON array of objects, strictly in this format: [{"keyword": "exact match keyword", "cluster": "Theme Name"}]. Keywords to organize: ${kwList}`;

    if (!isLlmConfigured()) {
      return { success: false, clustersUpdated: 0, error: "AI features disabled: set LLM_API_KEY" };
    }

    let responseText = "";
    try {
      responseText = await runChatCompletion([
        { role: "system", content: "You are an SEO grouping assistant. Output nothing except raw JSON." },
        { role: "user", content: prompt },
      ]);
    } catch (err: any) {
      console.error("LLM Runtime Error:", err.stack || err);
      return { success: false, clustersUpdated: 0, error: `LLM Execution Failed: ${err.message || String(err)}` };
    }

    let updates = 0;
    try {
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr) as { keyword: string; cluster: string }[];

      for (const obj of parsed) {
        if (!obj.keyword || !obj.cluster) continue;
        await db
          .update(savedKeywords)
          .set({ aiCluster: obj.cluster })
          .where(
            and(
              eq(savedKeywords.projectId, projectId),
              eq(savedKeywords.keyword, obj.keyword),
            ),
          );
        updates++;
      }
    } catch (e) {
      console.error("Failed to parse AI clustering. Raw Output:", responseText);
      return { success: false, clustersUpdated: updates, error: "AI sent fragmented JSON. Please try again." };
    }

    return { success: true, clustersUpdated: updates };
  });
