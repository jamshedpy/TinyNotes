function resolveAppUrl(raw: string | undefined): string {
  if (!raw || raw === "null" || raw === "undefined") {
    return "http://localhost:3000";
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "http://localhost:3000";
    }
    return parsed.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const env = {
  dbPath: process.env.DB_PATH ?? "./data/tinynotes.db",
  appUrl: resolveAppUrl(process.env.APP_URL),
  authSecret: process.env.AUTH_SECRET ?? "dev-secret-change-me",
};
