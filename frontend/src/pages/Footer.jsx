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
