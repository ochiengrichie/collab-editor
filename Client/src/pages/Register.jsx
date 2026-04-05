import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi, googleLogin } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import loginImg from "../assets/loginimg.svg";
import "../cssStyles/auth.css"

export default function Register() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await registerApi(form);

      if (!res?.success) {
        setError(res?.error || "Registration failed");
        return;
      }

      await refreshMe();
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Try a different email.");
      console.log("Registration Failed", err.response?.err || err.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-component" style={{ marginBottom: 24 }}>
          <h1>Create an Account</h1>
          <p style={{ color: "grey" }}>Join us and start collaborating!</p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <input 
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
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
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            <button disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>

            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                const credentials = credentialResponse.credential;
                try {
                  setError("");
                  const res = await googleLogin(credentials);
                  if (!res?.success) {
                    setError(res?.error || "Google registration failed");
                    return;
                  }
                  await refreshMe();
                  navigate("/dashboard");
                } catch (err) {
                  setError("Google registration failed.");
                  console.log("Google registration failed", err.response?.err)
                }
              }}
              onError={() => {
                console.log('Registration Failed');
              }}
            />

            {error ? <p style={{ color: "red" }}>{error}</p> : null}
          </form>

          <p style={{ marginTop: 12 , color: "grey"}}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
      </div>
      <div className="login-image">
        <img src={loginImg} alt="Login Illustration" />
      </div>
    </div>
  );
}
