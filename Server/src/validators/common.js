const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ROLES = ["owner", "editor", "viewer"];
export const MAX_DOC_CONTENT_LENGTH = 200000;
export const MAX_TITLE_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 72;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function trimValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

function pushIssue(issues, field, issue) {
  issues.push({ field, issue });
}

export function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function validateUuid(value) {
  return typeof value === "string" && UUID_V4_RE.test(value.trim());
}

export function validateEmail(value) {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(normalized);
}

export function validateRole(value) {
  return typeof value === "string" && ROLES.includes(value.trim());
}

export function validateSchema(target, schema, locationName) {
  const issues = [];

  if (!isObject(target)) {
    pushIssue(issues, locationName, "must be a JSON object");
    return { ok: false, issues };
  }

  const required = schema.required || [];
  const properties = schema.properties || {};
  const allowedKeys = Object.keys(properties);

  for (const field of required) {
    if (!(field in target)) {
      pushIssue(issues, field, "is required");
    }
  }

  if (schema.additionalProperties === false) {
    for (const key of Object.keys(target)) {
      if (!allowedKeys.includes(key)) {
        pushIssue(issues, key, "is not allowed");
      }
    }
  }

  for (const [field, rules] of Object.entries(properties)) {
    if (!(field in target)) continue;

    const rawValue = target[field];
    const value = trimValue(rawValue);
    target[field] = value;

    if (value === undefined || value === null) {
      if (rules.required) pushIssue(issues, field, "is required");
      continue;
    }

    if (rules.type === "string") {
      if (typeof value !== "string") {
        pushIssue(issues, field, "must be a string");
        continue;
      }
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        pushIssue(issues, field, `must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        pushIssue(issues, field, `must be at most ${rules.maxLength} characters`);
      }
      if (rules.format === "email" && !validateEmail(value)) {
        pushIssue(issues, field, "must be a valid email");
      }
      if (rules.format === "uuid" && !validateUuid(value)) {
        pushIssue(issues, field, "must be a valid UUID v4");
      }
      if (rules.enum && !rules.enum.includes(value)) {
        pushIssue(issues, field, `must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (rules.type === "integer") {
      if (!Number.isInteger(value)) {
        pushIssue(issues, field, "must be an integer");
        continue;
      }
      if (rules.min !== undefined && value < rules.min) {
        pushIssue(issues, field, `must be >= ${rules.min}`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
