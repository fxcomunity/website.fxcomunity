import { NeonAuthClient } from "@neondatabase/neon-js";

export const authClient = new NeonAuthClient({
  authUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
});
