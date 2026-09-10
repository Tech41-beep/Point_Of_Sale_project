import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
    </svg>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || data.error || "Sign in failed.");
      }
      if (!data.result?.token) {
        throw new Error("The server did not return an authentication token.");
      }
      localStorage.setItem("authToken", data.result.token);
      localStorage.setItem("currentUser", JSON.stringify(data.result.user));
      localStorage.removeItem("token");

      toast.success("Login successful!");
      navigate(
        data.result.user?.role === "user"
          ? "/shop"
          : data.result.user?.role === "cashier" ? "/sales/pos" : "/",
        { replace: true },
      );
      
    } catch (requestError) {
      const message = requestError.response?.data?.message;
      setError(message || (requestError.message === "Failed to fetch"
        ? "Cannot connect to the backend. Start the server on port 8000."
        : requestError.message || "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="Point of Sale">
        <div className="auth-brand-mark">P</div>
        <p className="auth-eyebrow">POINT OF SALE</p>
        <h1>Run your store<br /><span>with confidence.</span></h1>
        <p className="auth-brand-copy">A simpler way to manage sales, products, and customers from one place.</p>
        <div className="auth-orbit" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><div className="auth-brand-mark">P</div><strong>Point<span>Flow</span></strong></div>
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p className="auth-subtitle">Enter your details to access your dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="you@company.com" autoComplete="email" />
            <div className="auth-label-row"><label htmlFor="password">Password</label><Link to="/">Forgot password?</Link></div>
            <div className="auth-password-input">
              <LockIcon />
              <input id="password" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={updateField} placeholder="Enter your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}<span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-footer">New here? <Link to="/signup">Create a shopper account</Link></p>
        </div>
      </section>
    </main>
  );
}
