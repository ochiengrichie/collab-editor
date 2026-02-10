import { Link } from "react-router-dom";

export default function Header({ isLoggedIn , logout}) {
    return (
        <nav className="navbar">
            <h1>Collab-Editor</h1>
            {isLoggedIn ? (
                <button onClick={logout} className="nav-button">Logout</button>
            ) : (
                <div>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link">Register</Link>
                </div>
            )}
        </nav>
    );
}