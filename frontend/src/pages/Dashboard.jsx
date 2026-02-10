import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth.api";
import { createDocument, getMyDocuments } from "../api/docs.api";
import DocList from "../components/docs/DocList";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [contentText, setContentText] = useState("");

  const canCreate = useMemo(() => title.trim().length > 0, [title]);

  async function getMyDocs() {
    setLoadingDocs(true);
    setDocsError("");
    try {
      const data = await getMyDocuments();
      if (data?.success) {
        setDocs(data.data?.documents || []);
      } else {
        setDocs([]);
        setDocsError(data?.error || "Failed to load documents");
      }
    } catch (err) {
      setDocs([]);
      setDocsError(err?.response?.data?.error || err.message);
    } finally {
      setLoadingDocs(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutApi();
    } catch (err) {
      console.log("Failed to log out", err?.response?.data || err.message);
    } finally {
      await refreshMe();
      navigate("/login");
    }
  }

  async function handleCreateDoc(e) {
    e.preventDefault();
    if (!canCreate || creating) return;

    setCreating(true);
    setDocsError("");
    try {
      const data = await createDocument({
        title: title.trim(),
        content: contentText.trim(),
      });

      if (data?.success) {
        setTitle("");
        setContentText("");
        setShowCreate(false);
        await getMyDocs();
      } else {
        setDocsError(data?.error || "Failed to create document");
      }
    } catch (err) {
      setDocsError(err?.response?.data?.error || err.message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    getMyDocs();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email || "unknown"}</p>

      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setShowCreate((v) => !v)}>
        {showCreate ? "Cancel" : "Add Document"}
      </button>

      <hr style={{ margin: "20px 0" }} />
      <h2>Documents</h2>

      {showCreate ? (
        <form onSubmit={handleCreateDoc} style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 8, width: "70%" }}
          />
          <textarea
            placeholder="Document content"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            rows={4}
            style={{ padding: 8, width: "100%", marginTop: 8 }}
          />
          <button
            type="submit"
            disabled={!canCreate || creating}
            style={{ marginLeft: 8 }}
          >
            {creating ? "Creating..." : "Create Document"}
          </button>
        </form>
      ) : null}

      {docsError ? <p style={{ color: "red" }}>{docsError}</p> : null}

      {loadingDocs ? (
        <p>Loading documents...</p>
      ) : (
        <DocList documents={docs} onOpen={(doc) => navigate(`/docs/${doc.id}`)} />
      )}
    </div>
  );
}
