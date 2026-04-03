import api from "./client";

// Invite a member to a document
export async function inviteMember(documentId, payload) {
  const res = await api.post(`/api/docs/${documentId}/invite`, payload);
  return res.data;
}

// List members of a document
export async function listMembers(documentId) {
  const res = await api.get(`/api/docs/${documentId}/members`);
  return res.data;
}

// Update a member's role
export async function updateMemberRole(documentId, memberId, newRole) {
  const res = await api.patch(`/api/docs/${documentId}/members/${memberId}`, {
    newRole,
  });
  return res.data;
}

// Remove a member
export async function removeMember(documentId, memberId) {
  const res = await api.delete(`/api/docs/${documentId}/members/${memberId}`);
  return res.data;
}
