import api from "./client";

// GET current user (cookie-based)
export async function getMe() {
  const res = await api.get("/api/auth/me");
  return res.data; // expect { success, data }
}

export async function login(payload) {
  const res = await api.post("/api/auth/login", payload);
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

export async function googleLogin(token) {
  const res = await api.post("/api/auth/google", { token });
  return res.data;
}

export async function logout() {
  const res = await api.post("/api/auth/logout");
  return res.data;
}
