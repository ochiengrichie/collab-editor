import { Link } from "react-router-dom";
import "../cssStyles/footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <p className="footer-kicker">Collaborative workspace</p>
          <h2>Collab-Editor</h2>
          <p className="footer-copy">
            Real-time document editing for teams that need clean collaboration,
            fast access, and secure shared workspaces.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>Platform</h3>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/">Workspace Home</Link>
          </div>

          <div className="footer-column">
            <h3>Resources</h3>
            <a href="mailto:richard@collabeditor.dev">Support</a>
            <a href="mailto:richard@collabeditor.dev?subject=Collab-Editor%20Feedback">
              Feedback
            </a>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} Richard. All rights reserved.</p>
        <p>Built for focused, real-time collaboration.</p>
      </div>
    </footer>
  );
}


return (
    <div className="dashboard">
      <div className="dashboard-content">


        <section className="dashboard-toolbar">
          <h2 className="dashboard-section-title">Documents</h2>
          <button
            type="button"
            className="dashboard-toggle-button"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "Add Document"}
          </button>
        </section>

        {showCreate ? (
          <section className="dashboard-panel">
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
                rows={5}
              />
              <button
                className="dashboard-primary-button"
                type="submit"
                disabled={!canCreate || creating}
              >
                {creating ? "Creating..." : "Create Document"}
              </button>
            </form>
          </section>
        ) : null}

        {docsError ? <p className="dashboard-error">{docsError}</p> : null}

        <section className="dashboard-panel">
          {loadingDocs ? (
            <p className="dashboard-state">Loading documents...</p>
          ) : (
            <DocList documents={docs} onOpen={(doc) => navigate(`/docs/${doc.id}`)} />
          )}
        </section>
      </div>
    </div>
  );