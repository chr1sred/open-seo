import { isErrorCode, type ErrorCode } from "@/shared/error-codes";

const STANDARD_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Faça login e tente novamente.",
  FORBIDDEN: "Você não tem acesso a este recurso.",
  NOT_FOUND: "O recurso solicitado não foi encontrado.",
  AUDIT_CAPACITY_REACHED:
    "Você atingiu o limite de auditorias. Exclua auditorias antigas dos seus projetos para iniciar uma nova.",
  VALIDATION_ERROR: "Verifique os dados informados e tente novamente.",
  CRAWL_TARGET_BLOCKED:
    "Este endereço está bloqueado pela política de segurança do rastreador.",
  BACKLINKS_NOT_ENABLED:
    "O módulo de Backlinks ainda não está ativado na sua conta DataForSEO.",
  BACKLINKS_BILLING_ISSUE:
    "A conta DataForSEO conectada tem um problema de cobrança ou saldo.",
  RATE_LIMITED: "Muitas requisições. Aguarde um pouco e tente novamente.",
  CONFLICT: "Esta solicitação conflita com dados existentes.",
  INTERNAL_ERROR:
    "Ocorreu um erro inesperado. Verifique os logs do servidor e tente novamente.",
};

export function getStandardErrorMessage(
  error: unknown,
  fallback: string = STANDARD_MESSAGES.INTERNAL_ERROR,
): string {
  if (!(error instanceof Error)) return fallback;
  if (isErrorCode(error.message)) return STANDARD_MESSAGES[error.message];
  return fallback;
}

export function getErrorCode(error: unknown): ErrorCode | null {
  if (!(error instanceof Error)) return null;
  return isErrorCode(error.message) ? error.message : null;
}
