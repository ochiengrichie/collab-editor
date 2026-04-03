//This file keeps track of who is logged in and makes that information available to the whole app.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../api/auth.api";
import { logout as logoutApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = not logged in
  const [loading, setLoading] = useState(true); // true while checking /me

  async function refreshMe() {
    setLoading(true);
    try {
      const data = await getMe();

      // Your backend response shape: { success, data, error }
      // If logged in: success=true and data contains user info
      if (data?.success) {
        setUser(data.data); // could be { id, email } or { user: ... } depending on your backend
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      const status = err?.response?.status;
      // 401 is expected when no session cookie exists
      if (status && status !== 401) {
        console.log("Error fetching user data", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutApi();
      setUser(null);
    } catch (err) {
      console.error("Error logging out", err);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, refreshMe, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
};

