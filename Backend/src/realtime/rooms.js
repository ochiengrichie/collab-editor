import db from "../db/index.js";
import { getLatestDocState, appendSnapshot } from "../services/docs.persistence.service.js";
import { getDocState, setDocState, scheduleSave } from "./saveQueue.js";

function roomName(docId) {
  return `doc:${docId}`;
}

// In-memory presence tracking: Map<documentId, Set<userId>>
const presenceByDoc = new Map();

function getPresenceSet(docId) {
  if (!presenceByDoc.has(docId)) presenceByDoc.set(docId, new Set());
  return presenceByDoc.get(docId);
}

export function registerRoomHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    const email = socket.user?.email;

    console.log(`Socket connected: ${email || "unknown"} (id=${userId})`);

    // JOIN DOCUMENT
    socket.on("join-document", async ({ documentId }) => {
      if (!documentId) {
        return socket.emit("error", { message: "documentId is required" });
      }

      try {
        // 1) Membership check
        const membership = await db.query(
          "SELECT role FROM document_members WHERE document_id = $1 AND user_id = $2",
          [documentId, userId]
        );

        if (membership.rows.length === 0) {
          return socket.emit("error", { message: "Access denied: not a member" });
        }

        // 2) Join room
        const room = roomName(documentId);
        socket.join(room);

        // 3) Load latest saved state (DB) and cache it in memory
        const latest = await getLatestDocState(documentId);
        setDocState(documentId, latest);

        // 4) Send current state to this joining user
        socket.emit("doc-state", latest);

        // 5) Presence update
        const set = getPresenceSet(documentId);
        set.add(String(userId));
        io.to(room).emit("presence-update", {
          documentId,
          onlineUsers: Array.from(set),
        });

        socket.emit("joined-document", {
          documentId,
          role: membership.rows[0].role,
        });
      } catch (err) {
        console.error("join-document error:", err);
        socket.emit("error", { message: "Server error joining document" });
      }
    });

    // LEAVE DOCUMENT
    socket.on("leave-document", ({ documentId }) => {
      if (!documentId) return;

      const room = roomName(documentId);
      socket.leave(room);

      const set = getPresenceSet(documentId);
      set.delete(String(userId));

      io.to(room).emit("presence-update", {
        documentId,
        onlineUsers: Array.from(set),
      });
    });

    /**
      DOC UPDATE
     Client sends: { documentId, content, baseVersion }
      baseVersion = the version the client started editing from
      Server checks if baseVersion matches current cached version.
      If mismatch, server tells client to resync (doc-resync).
     */
    socket.on("doc-update", async({ documentId, content, baseVersion }) => {
      if (!documentId) {
        return socket.emit("error", { message: "documentId is required" });
      }

       // Enforce role: only editor/owner can edit
      try {
        const roleResult = await db.query(
          "SELECT role FROM document_members WHERE document_id = $1 AND user_id = $2",
          [documentId, userId]
        );
        if (roleResult.rows.length === 0) {
          return socket.emit("error", { message: "Access denied: not a member" });
        }
        const role = roleResult.rows[0].role;
        if (role !== "editor" && role !== "owner") {
          return socket.emit("error", { message: "Access denied: read-only" });
        }
      } catch (err) {
        console.error("doc-update role check failed:", err);
        return socket.emit("error", { message: "Server error checking role" });
      }

      const current = getDocState(documentId) || { content: "", version: 0 };

      // If client is editing an old version, force resync
      if (typeof baseVersion !== "number" || baseVersion !== current.version) {
        socket.emit("doc-resync", current);
        return;
      }

      // Accept update: bump version in memory
      const nextState = { content, version: current.version + 1 };
      setDocState(documentId, nextState);

      const room = roomName(documentId);

      // Broadcast to others in the room
      socket.to(room).emit("doc-update", {documentId,
        content,
        version: nextState.version,   
        updatedBy: userId, 
      });

      // Debounced save to DB
      scheduleSave({
        documentId,
        content,
        userId,
        saveFn: appendSnapshot,
        debounceMs: 1500,
      });

      // Confirm to sender what version the server accepted
      socket.emit("doc-ack", { documentId, version: nextState.version });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${email || "unknown"} (id=${userId})`);

      for (const [docId, set] of presenceByDoc.entries()) {
        if (set.has(String(userId))) {
          set.delete(String(userId));
          io.to(roomName(docId)).emit("presence-update", {
            documentId: docId,
            onlineUsers: Array.from(set),
          });
        }
      }
    });
  });
}

export default registerRoomHandlers;
