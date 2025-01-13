export type Locale = (typeof locales)[number];

export const locales = ['en', 'cn'] as const;
export const defaultLocale: Locale = 'en';
