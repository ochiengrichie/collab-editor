import api from "./client";

// GET all docs for current user
export async function getMyDocuments() {
  const res = await api.get("/api/docs");
  return res.data; // expect { success, data: { documents } }
}

// POST create a new document
export async function createDocument(payload) {
  const res = await api.post("/api/docs", payload);
  return res.data; // expect { success, data: { document } }
}

// GET a single document by id
export async function openDocument(id) {
  const res = await api.get(`/api/docs/${id}`);
  return res.data; // expect { success, data: { document } }
}