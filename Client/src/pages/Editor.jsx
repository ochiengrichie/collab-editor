import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { openDocument } from "../api/docs.api";
import { inviteMember, listMembers, removeMember, updateMemberRole } from "../api/members.api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../realtime/socket";
import "../cssStyles/editor.css";

export default function Editor() {
  const { id: documentId } = useParams();

  const [title, setTitle] = useState("Loading...");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState("connecting...");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersError, setMembersError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showInviteForm, setShowInviteForm ] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const { user } = useAuth();
  const currentRole = members.find((m) => m.id === user?.id)?.role;
  const isOwner = currentRole === "owner";

  // Prevent sending updates before we have initial state
  const readyRef = useRef(false);

  // 1) Load doc via HTTP (basic info)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await openDocument(documentId);
        if (!cancelled && data?.success) {
          setTitle(data.data?.document?.title || "Untitled");
          // backend doc content is TEXT
          setContent(data.data?.document?.content || "");
          setVersion(data.data?.document?.version || 0);
          setUpdatedAt(data.data?.document?.updated_at || null);
        }
      } catch {
        // ignore for now
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  async function loadMembers() {
    setLoadingMembers(true);
    setMembersError("");
    try {
      const data = await listMembers(documentId);
      if (data?.success) {
        setMembers(data.data?.members || []);
      } else {
        setMembers([]);
        setMembersError(data?.error || "Failed to load members");
      }
    } catch (err) {
      setMembers([]);
      setMembersError(err?.response?.data?.error || err.message);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setMembersError("");
    try {
      const data = await inviteMember(documentId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      if (data?.success) {
        setInviteEmail("");
        setInviteEmail(false);
        await loadMembers();
      } else {
        setMembersError(data?.error || "Failed to invite member");
      }
    } catch (err) {
      setMembersError(err?.response?.data?.error || err.message);
    }
  }

  async function handleRoleChange(memberId, newRole) {
    setMembersError("");
    try {
      const data = await updateMemberRole(documentId, memberId, newRole);
      if (data?.success) {
        await loadMembers();
      } else {
        setMembersError(data?.error || "Failed to update role");
      }
    } catch (err) {
      setMembersError(err?.response?.data?.error || err.message);
    }
  }

  async function handleRemove(memberId) {
    setMembersError("");
    try {
      const data = await removeMember(documentId, memberId);
      if (data?.success) {
        await loadMembers();
      } else {
        setMembersError(data?.error || "Failed to remove member");
      }
    } catch (err) {
      setMembersError(err?.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [documentId]);

  // 2) Socket connect + join room
  useEffect(() => {
    readyRef.current = false;

    function onConnect() {
      setStatus("connected");
      socket.emit("join-document", { documentId });
    }

    function onDocState(payload) {
      // payload: { content, version }
      setContent(payload.content || "");
      setVersion(payload.version || 0);
      readyRef.current = true;
      setStatus("synced");
    }

    function onDocUpdate(payload) {
      // payload: { documentId, content, version, updatedBy }
      if (payload.documentId !== documentId) return;
      setContent(payload.content || "");
      setVersion(payload.version || 0);
    }

    function onDocResync(payload) {
      // payload: { content, version }
      setContent(payload.content || "");
      setVersion(payload.version || 0);
      setStatus("resynced");
      readyRef.current = true;
    }

    function onDocAck(payload) {
      // payload: { documentId, version }
      if (payload.documentId !== documentId) return;
      setVersion(payload.version || 0);
    }

    function onPresence(payload) {
      if (payload.documentId !== documentId) return;
      setOnlineUsers(payload.onlineUsers || []);
    }

    function onError(payload) {
      setStatus(payload?.message || "error");
    }

    socket.on("connect", onConnect);
    socket.on("doc-state", onDocState);
    socket.on("doc-update", onDocUpdate);
    socket.on("doc-resync", onDocResync);
    socket.on("doc-ack", onDocAck);
    socket.on("presence-update", onPresence);
    socket.on("error", onError);

    if (!socket.connected) socket.connect();

    return () => {
      socket.emit("leave-document", { documentId });
      socket.off("connect", onConnect);
      socket.off("doc-state", onDocState);
      socket.off("doc-update", onDocUpdate);
      socket.off("doc-resync", onDocResync);
      socket.off("doc-ack", onDocAck);
      socket.off("presence-update", onPresence);
      socket.off("error", onError);
      // Optional: disconnect only if you want socket per-page
      socket.disconnect();
    };
  }, [documentId]);

  // 3) Send updates as user types
  function handleChange(e) {
    const next = e.target.value;
    setContent(next);

    // Only emit after we have initial version from server
    if (!readyRef.current) return;

    socket.emit("doc-update", {
      documentId,
      content: next,
      baseVersion: version,
    });
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div>
          <h1 className="editor-title">{title}</h1>
          <p className="editor-status">
            Status: {status} | Version: {version} | Online: {onlineUsers.length}
            {updatedAt ? (
              <>
                {' | Updated: '}
                {new Date(updatedAt).toLocaleString()}
              </>
            ) : null}
          </p>
        </div>
        <div className="editor-header-buttons">
          {isOwner && (
            <button
              type="button"
              className="editor-header-button"
              onClick={() => setShowInviteForm((prev) => !prev)}
            >
              Invite Members
            </button>
          )}
          <button
            type="button"
            className="editor-header-button secondary"
            onClick={() => setShowMembers((prev) => !prev)}
          >
            {showMembers ? 'Hide Users' : 'View All Users'}
          </button>
        </div>
      </div>

      {showInviteForm && isOwner && (
        <div className="editor-section">
          <form onSubmit={handleInvite} className="editor-form">
            <div className="editor-form-row">
              <input
                type="email"
                placeholder="Invite by email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="editor-input"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="editor-select"
              >
                <option value="viewer">viewer</option>
                <option value="editor">editor</option>
                <option value="owner">owner</option>
              </select>
              <button type="submit" className="editor-submit-button">
                Invite
              </button>
            </div>
          </form>
        </div>
      )}

      {showMembers && (
        <div className="editor-section">
          <h3 className="editor-section-title">Collaborators</h3>
          {membersError ? <p className="editor-error">{membersError}</p> : null}

          {loadingMembers ? (
            <p className="editor-state">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="editor-state">No members yet.</p>
          ) : (
            <ul className="editor-members-list">
              {members.map((m) => (
                <li key={m.id} className="editor-member-item">
                  <div className="editor-member-info">
                    {m.name} — {m.role}
                    {user?.id === m.id ? <span className="editor-member-you"> (you)</span> : null}
                  </div>
                  {isOwner ? (
                    <div className="editor-member-controls">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        disabled={m.id === user?.id}
                        className="editor-select-small"
                      >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                        <option value="owner">owner</option>
                      </select>
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={m.id === user?.id}
                        className="editor-remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <textarea
        value={content}
        onChange={handleChange}
        rows={18}
        className="editor-textarea"
        placeholder="Start typing..."
      />
    </div>
  );
}
