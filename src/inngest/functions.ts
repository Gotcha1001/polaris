import { generateText } from "ai";
import { inngest } from "./client";
import { anthropic } from "@ai-sdk/anthropic";
import { firecrawl } from "@/lib/firecrawl";

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

    const urls = (await step.run("extract-urls", async () => {
      // 1. Extract URLs from the prompt
      return prompt.match(URL_REGEX) ?? [];
    })) as string[];

    // 2. Scrape content from the URLs in a markdown format
    const scrapedContent = await step.run("scrap-urls", async () => {
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrapeUrl(url, {
            formats: ["markdown"],
          });

          if (!result.success) {
            console.error(`Failed to scrape ${url}:`, result.error);
            return null;
          }

          return result.markdown ?? null;
        })
      );
      return results.filter(Boolean).join("\n\n");
    });
    // 3. Generate a response using the scraped content as context
    const finalPrompt = scrapedContent
      ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
      : prompt;

    await step.run("generate-text", async () => {
      return await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt: finalPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    });
  }
);

export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("Inngest error: Background job failed!");
    });
  }
);
