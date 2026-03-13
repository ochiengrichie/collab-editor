import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, googleLogin } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import loginImg from "../assets/loginimg.svg";
import "../cssStyles/auth.css"

export default function Login() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(form);

      if (!res?.success) {
        setError(res?.error || "Login failed");
        return;
      }

      // Re-check user session from backend (/me)
      await refreshMe();

      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Check your email/password.");
      console.log("Login failed", err.response?.err )
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" >
      <div className="login-component" style={{ marginBottom: 24 }}>
        <h1>Welcome Back!</h1>
        <p style={{ color: "grey" }}>Login to continue</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const credentials =credentialResponse.credential;
              console.log("Google login successful", credentialResponse);
              try {
                setError("");
                const res = await googleLogin(credentials);
                if (!res?.success) {
                  setError(res?.error || "Google login failed");
                  return;
                }
                await refreshMe();
                navigate("/dashboard");
              } catch (err) {
                setError("Google login failed.");
                console.log("Google login failed", err.response?.err)
              }
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />

          {error ? <p style={{ color: "red" }}>{error}</p> : null}
        </form>

        <p style={{ marginTop: 12 , color: "grey"}}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
      <div className="login-image">
        <img src={loginImg} alt="Login Illustration" />
      </div>
    </div>
  );
}
