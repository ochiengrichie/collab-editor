import { Link } from "react-router-dom";
import "../cssStyles/header.css";

export default function Header({logout}) {
    return (
        <nav className="navbar">
            <h1>Collab-Editor</h1>
            <button onClick={logout} className="nav-button">Logout</button>     
        </nav>
    );
}