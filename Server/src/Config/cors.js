const DEV_FALLBACK_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

function parseCsvOrigins(value = "") {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function dedupe(list) {
  return Array.from(new Set(list));
}

function buildAllowedOrigins() {
  const fromSingle = process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : [];
  const fromMany = parseCsvOrigins(process.env.CLIENT_URLS || "");
  const envOrigins = dedupe([...fromSingle, ...fromMany]);

  if (envOrigins.length > 0) return envOrigins;

  if (process.env.NODE_ENV === "production") {
    throw new Error("CORS config missing. Set CLIENT_URL or CLIENT_URLS in production.");
  }

  return DEV_FALLBACK_ORIGINS;
}

export const allowedOrigins = buildAllowedOrigins();

export function isOriginAllowed(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

export const httpCorsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
