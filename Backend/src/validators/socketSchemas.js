import { MAX_DOC_CONTENT_LENGTH } from "./common.js";

export const socketSchemas = {
  joinDocument: {
    required: ["documentId"],
    additionalProperties: false,
    properties: {
      documentId: { type: "string", format: "uuid" },
    },
  },
  leaveDocument: {
    required: ["documentId"],
    additionalProperties: false,
    properties: {
      documentId: { type: "string", format: "uuid" },
    },
  },
  docUpdate: {
    required: ["documentId", "content", "baseVersion"],
    additionalProperties: false,
    properties: {
      documentId: { type: "string", format: "uuid" },
      content: { type: "string", maxLength: MAX_DOC_CONTENT_LENGTH },
      baseVersion: { type: "integer", min: 0 },
    },
  },
};
