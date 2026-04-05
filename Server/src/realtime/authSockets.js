import jwt from "jsonwebtoken";

// Helper function to parse cookies from the header
function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").map(v => v.trim()).filter(Boolean).reduce((acc, pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return acc;
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(val);
      return acc;
    }, {});
}

export function socketAuthMiddleware(socket, next) {
  try {
    const cookieHeader = socket.handshake.headers?.cookie || "";
    const cookies = parseCookies(cookieHeader);

    // 1) Prefer HttpOnly cookie token (your main auth strategy)
    let token = cookies.token;

    // 2) Fallback: Authorization: Bearer <token> (useful for Postman tests)
    if (!token) {
      const authHeader = socket.handshake.headers?.authorization || "";
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, email, ... }
    return next();
  } catch (err) {
    return next(new Error("Authentication error: invalid/expired token"));
  }
}

export default socketAuthMiddleware;
