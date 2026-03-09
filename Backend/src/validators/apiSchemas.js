import {
  MAX_DOC_CONTENT_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_TITLE_LENGTH,
  ROLES,
} from "./common.js";

export const authSchemas = {
  register: {
    body: {
      required: ["email", "password"],
      additionalProperties: false,
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6, maxLength: MAX_PASSWORD_LENGTH },
      },
    },
  },
  login: {
    body: {
      required: ["email", "password"],
      additionalProperties: false,
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 1, maxLength: MAX_PASSWORD_LENGTH },
      },
    },
  },
  google: {
    body: {
      required: ["token"],
      additionalProperties: false,
      properties: {
        token: { type: "string", minLength: 20 },
      },
    },
  },
};

export const docsSchemas = {
  createDoc: {
    body: {
      required: ["title"],
      additionalProperties: false,
      properties: {
        title: { type: "string", minLength: 1, maxLength: MAX_TITLE_LENGTH },
        content: { type: "string", maxLength: MAX_DOC_CONTENT_LENGTH },
      },
    },
  },
  openDoc: {
    params: {
      required: ["id"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
      },
    },
  },
  renameDoc: {
    params: {
      required: ["id"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
      },
    },
    body: {
      required: ["newTitle"],
      additionalProperties: false,
      properties: {
        newTitle: { type: "string", minLength: 1, maxLength: MAX_TITLE_LENGTH },
      },
    },
  },
  inviteMember: {
    params: {
      required: ["id"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
      },
    },
    body: {
      required: ["email", "role"],
      additionalProperties: false,
      properties: {
        email: { type: "string", format: "email" },
        role: { type: "string", enum: ROLES },
      },
    },
  },
  listMembers: {
    params: {
      required: ["id"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
      },
    },
  },
  updateMemberRole: {
    params: {
      required: ["id", "memberId"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
        memberId: { type: "string", format: "uuid" },
      },
    },
    body: {
      required: ["newRole"],
      additionalProperties: false,
      properties: {
        newRole: { type: "string", enum: ROLES },
      },
    },
  },
  removeMember: {
    params: {
      required: ["id", "memberId"],
      additionalProperties: true,
      properties: {
        id: { type: "string", format: "uuid" },
        memberId: { type: "string", format: "uuid" },
      },
    },
  },
};
