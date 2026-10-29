export const DEFAULT_LOCATION_CODE = 2076;

export const LOCATION_OPTIONS = [
  { code: 2076, label: "Brasil", shortLabel: "BR", languageCode: "pt" },
  { code: 2620, label: "Portugal", shortLabel: "PT", languageCode: "pt" },
  { code: 2840, label: "Estados Unidos", shortLabel: "US", languageCode: "en" },
  { code: 2826, label: "Reino Unido", shortLabel: "UK", languageCode: "en" },
  { code: 2124, label: "Canadá", shortLabel: "CA", languageCode: "en" },
  { code: 2036, label: "Austrália", shortLabel: "AU", languageCode: "en" },
  { code: 2372, label: "Irlanda", shortLabel: "IE", languageCode: "en" },
  { code: 2554, label: "Nova Zelândia", shortLabel: "NZ", languageCode: "en" },
  { code: 2356, label: "Índia", shortLabel: "IN", languageCode: "en" },
  { code: 2702, label: "Singapura", shortLabel: "SG", languageCode: "en" },
  { code: 2710, label: "África do Sul", shortLabel: "ZA", languageCode: "en" },
  { code: 2608, label: "Filipinas", shortLabel: "PH", languageCode: "en" },
  { code: 2276, label: "Alemanha", shortLabel: "DE", languageCode: "de" },
  { code: 2250, label: "França", shortLabel: "FR", languageCode: "fr" },
  { code: 2528, label: "Países Baixos", shortLabel: "NL", languageCode: "nl" },
  { code: 2724, label: "Espanha", shortLabel: "ES", languageCode: "es" },
  { code: 2380, label: "Itália", shortLabel: "IT", languageCode: "it" },
  { code: 2040, label: "Áustria", shortLabel: "AT", languageCode: "de" },
  { code: 2756, label: "Suíça", shortLabel: "CH", languageCode: "de" },
  { code: 2752, label: "Suécia", shortLabel: "SE", languageCode: "sv" },
  { code: 2578, label: "Noruega", shortLabel: "NO", languageCode: "nb" },
  { code: 2208, label: "Dinamarca", shortLabel: "DK", languageCode: "da" },
  { code: 2616, label: "Polônia", shortLabel: "PL", languageCode: "pl" },
  { code: 2203, label: "Tchéquia", shortLabel: "CZ", languageCode: "cs" },
  { code: 2642, label: "Romênia", shortLabel: "RO", languageCode: "ro" },
  { code: 2792, label: "Turquia", shortLabel: "TR", languageCode: "tr" },
  { code: 2300, label: "Grécia", shortLabel: "GR", languageCode: "el" },
  { code: 2348, label: "Hungria", shortLabel: "HU", languageCode: "hu" },
  { code: 2484, label: "México", shortLabel: "MX", languageCode: "es" },
  { code: 2032, label: "Argentina", shortLabel: "AR", languageCode: "es" },
  { code: 2170, label: "Colômbia", shortLabel: "CO", languageCode: "es" },
  { code: 2152, label: "Chile", shortLabel: "CL", languageCode: "es" },
  { code: 2604, label: "Peru", shortLabel: "PE", languageCode: "es" },
  { code: 2392, label: "Japão", shortLabel: "JP", languageCode: "ja" },
  { code: 2410, label: "Coreia do Sul", shortLabel: "KR", languageCode: "ko" },
  { code: 2360, label: "Indonésia", shortLabel: "ID", languageCode: "id" },
  { code: 2458, label: "Malásia", shortLabel: "MY", languageCode: "ms" },
  { code: 2764, label: "Tailândia", shortLabel: "TH", languageCode: "th" },
  { code: 2704, label: "Vietnã", shortLabel: "VN", languageCode: "vi" },
  {
    code: 2784,
    label: "Emirados Árabes Unidos",
    shortLabel: "AE",
    languageCode: "en",
  },
  { code: 2682, label: "Arábia Saudita", shortLabel: "SA", languageCode: "ar" },
] as const;

const LOCATION_CODES = new Set<number>(
  LOCATION_OPTIONS.map((option) => option.code),
);

export const LOCATIONS: Record<number, string> = Object.fromEntries(
  LOCATION_OPTIONS.map((option) => [option.code, option.shortLabel]),
);

const LOCATION_LANGUAGE: Record<number, string> = Object.fromEntries(
  LOCATION_OPTIONS.map((option) => [option.code, option.languageCode]),
);

export function getLanguageCode(locationCode: number): string {
  return LOCATION_LANGUAGE[locationCode] ?? "en";
}

export function isSupportedLocationCode(locationCode: number): boolean {
  return LOCATION_CODES.has(locationCode);
}
