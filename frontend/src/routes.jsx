import { Routes , Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import ProtectedRoute from "./Components/Layout/ProtectedRoute.jsx";
import Header from "./pages/Header.jsx";

function RootRedirect() {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function AppRoutes(){
    return (
        <div>
            <Header isLoggedIn={!!useAuth().user} logout={useAuth().logout}/>
            <main style={{ padding: 24 }}>
            <Routes>
                <Route path="/" element={<RootRedirect />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
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