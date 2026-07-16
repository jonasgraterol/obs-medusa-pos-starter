/**
 * Static Medusa backend URL.
 *
 * Set via the EXPO_PUBLIC_MEDUSA_URL environment variable (e.g. in .env or eas.json secrets).
 * The value must include the protocol (e.g. "https://api.example.com").
 */
export const MEDUSA_BACKEND_URL: string = process.env.EXPO_PUBLIC_MEDUSA_URL ?? '';

if (!MEDUSA_BACKEND_URL) {
  throw new Error(
    'EXPO_PUBLIC_MEDUSA_URL is not set. Add it to your .env file or EAS secrets.',
  );
}
