type Level = "info" | "warn" | "error";

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production" && level === "info") return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...meta });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
