// Custom environment variable type definitions
// These extend the auto-generated Env interface from worker-configuration.d.ts

declare namespace Cloudflare {
  interface Env {
    R2: R2Bucket;

    // DataForSEO API Basic auth value (base64 of login:password)
    DATAFORSEO_API_KEY: string;

    // Optional HTTP Basic Auth protecting the whole app (self-hosting)
    BASIC_AUTH_USER?: string;
    BASIC_AUTH_PASSWORD?: string;

    // Optional OpenAI-compatible LLM provider for AI features
    // (OpenAI, OpenRouter, Groq, Ollama, Gemini OpenAI endpoint, ...)
    LLM_API_KEY?: string;
    LLM_BASE_URL?: string;
    LLM_MODEL?: string;

    // Secret required by the internal cron endpoint (/__internal/cron)
    CRON_SECRET?: string;

    // Public URL of this deployment (used in Discord alerts)
    APP_URL?: string;
    DISCORD_WEBHOOK_URL?: string;
  }
}
