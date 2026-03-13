import { useState } from "react";
import { Routes , Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import ProtectedRoute from "./Components/Layout/ProtectedRoute.jsx";
import Header from "./pages/Header.jsx";
import SideBar from "./pages/SideBar.jsx";

function RootRedirect() {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function DashboardLayout({ logout }) {
    const [showCreate, setShowCreate] = useState(false);

    function toggleCreateDocument() {
        setShowCreate((prev) => !prev);
    }

    return (
        <>
            <Header logout={logout}/>
            <div className="dashboard-shell">
                <SideBar onCreateDocument={toggleCreateDocument} />
                <Dashboard showCreate={showCreate} setShowCreate={setShowCreate} />
            </div>
        </>
    );
}

export default function AppRoutes(){
    const { logout } = useAuth();

    return (
        <div>     
            <main>
            <Routes>
                <Route path="/" element={<RootRedirect />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout logout={logout} />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/docs/:id" 
                    element={
                        <ProtectedRoute>
                            <Editor />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            </main>
        </div>
    )
}
