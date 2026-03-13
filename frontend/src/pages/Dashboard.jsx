import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument, getMyDocuments } from "../api/docs.api";
import DocList from "../components/docs/DocList";
import { useAuth } from "../context/AuthContext";
import "../cssStyles/dashboard.css";

export default function Dashboard({ showCreate = false, setShowCreate = () => {} }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [contentText, setContentText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate = useMemo(() => title.trim().length > 0, [title]);

  const filteredDocs = useMemo(() => {
    if (!searchTerm.trim()) return docs;
    return docs.filter(doc =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [docs, searchTerm]);

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
        setShowCreate?.(false);
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
    <div className="dashboard">
      <div className="dashboard-content">
        <section className="dashboard-hero">
          <h1 className="dashboard-title">
            Welcome back, {user?.name || user?.email || "User"}
          </h1>
          <p className="dashboard-subtitle">
            Manage and open your collaborative documents from one place.
          </p>
        </section>

        <hr style={{ margin: "20px 0" }} />
        <div className="dashboard-panel">
          <div className="dashboard-toolbar">
            <h2 className="dashboard-section-title">Documents</h2>
            <form className="dashboard-search-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dashboard-search-input"
              />
              <button type="submit" className="dashboard-search-button">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-search-icon">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </form>
          </div>

          {showCreate ? (
            <form onSubmit={handleCreateDoc} className="dashboard-form">
              <input
                className="dashboard-input"
                type="text"
                placeholder="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="dashboard-textarea"
                placeholder="Document content"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={4}
              />
              <button
                type="submit"
                className="dashboard-primary-button"
                disabled={!canCreate || creating}
              >
                {creating ? "Creating..." : "Create Document"}
              </button>
            </form>
          ) : null}

          {docsError ? <p className="dashboard-error">{docsError}</p> : null}

          {loadingDocs ? (
            <p className="dashboard-state">Loading documents...</p>
          ) : (
            <div className="doc-list">
              <DocList documents={filteredDocs} onOpen={(doc) => navigate(`/docs/${doc.id}`)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
