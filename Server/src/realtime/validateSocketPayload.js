import { validateSchema } from "../validators/common.js";

function buildMessage(issues) {
  if (!issues.length) return "Validation failed";
  return issues.map((i) => `${i.field} ${i.issue}`).join("; ");
}

export function validateSocketPayload(payload, schema, socket) {
  const result = validateSchema(payload || {}, schema, "payload");
  if (result.ok) return true;

  socket.emit("error", {
    code: "VALIDATION_ERROR",
    message: buildMessage(result.issues),
    details: result.issues,
  });
  return false;
}

export default validateSocketPayload;
