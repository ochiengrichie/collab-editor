import { createResponse } from "../utils/response.js";
import { validateSchema } from "../validators/common.js";

function buildErrorMessage(issues) {
  if (!issues.length) return "Validation failed";
  return issues.map((i) => `${i.field} ${i.issue}`).join("; ");
}

export default function validateRequest(schema = {}) {
  return (req, res, next) => {
    const allIssues = [];

    if (schema.params) {
      const result = validateSchema(req.params || {}, schema.params, "params");
      if (!result.ok) allIssues.push(...result.issues);
    }

    if (schema.body) {
      const result = validateSchema(req.body || {}, schema.body, "body");
      if (!result.ok) allIssues.push(...result.issues);
    }

    if (allIssues.length > 0) {
      return createResponse(
        res,
        false,
        { details: allIssues },
        buildErrorMessage(allIssues),
        400
      );
    }

    return next();
  };
}
