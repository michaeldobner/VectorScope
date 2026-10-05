// Types for the translation module, used by the proxy and by INTEL in the browser.
export function chunk(texts: string[]): string[][];
export function parseGoogle(json: unknown): string;
export function translateAll(texts: string[], to?: 'de' | 'en', fetchImpl?: typeof fetch): Promise<(string | null)[]>;
