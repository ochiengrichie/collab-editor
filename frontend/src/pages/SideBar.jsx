import { NavLink } from "react-router-dom";
import "../cssStyles/sidebar.css";
//import { createDocument } from "../api/docs.api";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.25 3.75 10v10.25a1 1 0 0 0 1 1H10v-6h4v6h5.25a1 1 0 0 0 1-1V10L12 3.25Z" />
      </svg>
    ),
  },
  {
    label: "My Documents",
    to: "/dashboard?view=my-docs",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.75A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6Zm2.25 4.5h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5Zm0 3.5h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5Zm0 3.5h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1 0-1.5Z" />
      </svg>
    ),
  },
  {
    label: "Shared With Me",
    to: "/dashboard?view=shared",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm6 1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.75 19.5A4.5 4.5 0 0 1 8.25 15h1.5a4.5 4.5 0 0 1 4.5 4.5.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75Zm11.917.75a5.935 5.935 0 0 0-1.233-3.54A3.75 3.75 0 0 1 16.5 16.5h1.125A3.375 3.375 0 0 1 21 19.875a.375.375 0 0 1-.375.375h-4.958Z" />
      </svg>
    ),
  },
];

export default function SideBar({ onCreateDocument }) {
  return (
    <aside className="sidebar" aria-label="Dashboard navigation">
      <nav className="sidebar-links">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-actions">
        <button
          type="button"
          className="sidebar-create-button"
          onClick={onCreateDocument}
        >
          <span className="sidebar-create-icon" aria-hidden="true">
            +
          </span>
          <span>Create Document</span>
        </button>
      </div>
    </aside>
  );
}
