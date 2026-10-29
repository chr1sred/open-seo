import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { authenticatedServerFunctionMiddleware } from "@/serverFunctions/middleware";
import { fetchDataforseoBalance } from "@/server/lib/dataforseoAccount";

export const getSeoApiKeyStatus = createServerFn({ method: "GET" })
  .middleware(authenticatedServerFunctionMiddleware)
  .handler(() => {
    const configured = Boolean(env.DATAFORSEO_API_KEY?.trim());
    return { configured };
  });

export const getDataforseoBalance = createServerFn({ method: "GET" })
  .middleware(authenticatedServerFunctionMiddleware)
  .handler(async () => {
    if (!env.DATAFORSEO_API_KEY?.trim()) {
      return null;
    }
    return fetchDataforseoBalance();
  });
