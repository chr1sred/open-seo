import { env } from "cloudflare:workers";
import { z } from "zod";

const userDataResponseSchema = z.object({
  status_code: z.number().optional(),
  status_message: z.string().optional(),
  tasks: z
    .array(
      z.object({
        status_code: z.number().optional(),
        status_message: z.string().optional(),
        result: z
          .array(
            z.object({
              login: z.string().nullish(),
              money: z
                .object({
                  total: z.number().nullish(),
                  balance: z.number().nullish(),
                })
                .passthrough()
                .nullish(),
            }),
          )
          .nullish(),
      }),
    )
    .nullish(),
});

export type DataforseoBalance = {
  login: string | null;
  balance: number | null;
  totalDeposited: number | null;
  spent: number | null;
};

/**
 * Account balance from DataForSEO's free `appendix/user_data` endpoint.
 */
export async function fetchDataforseoBalance(): Promise<DataforseoBalance> {
  const response = await fetch(
    "https://api.dataforseo.com/v3/appendix/user_data",
    {
      headers: { Authorization: `Basic ${env.DATAFORSEO_API_KEY}` },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new Error(`DataForSEO HTTP ${response.status} on user_data`);
  }

  const parsed = userDataResponseSchema.parse(await response.json());
  if (parsed.status_code !== 20000) {
    throw new Error(parsed.status_message || "DataForSEO user_data failed");
  }

  const result = parsed.tasks?.[0]?.result?.[0];
  const balance = result?.money?.balance ?? null;
  const totalDeposited = result?.money?.total ?? null;
  const spent =
    balance !== null && totalDeposited !== null
      ? Math.max(0, totalDeposited - balance)
      : null;

  return {
    login: result?.login ?? null,
    balance,
    totalDeposited,
    spent,
  };
}
