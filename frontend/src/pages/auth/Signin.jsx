import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem("authToken") || sessionStorage.getItem("authToken")) {
    return <Navigate to="/" replace />;
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      const storage = remember ? localStorage : sessionStorage;
      // Remove tokens written by the previous frontend implementation. The API
      // prioritizes bearer tokens, so a stale legacy token can override the new cookie.
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      storage.setItem("authToken", data.result.token);
      storage.setItem("currentUser", JSON.stringify(data.result.user));
      navigate(location.state?.from || "/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't sign you in. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="PayPoint introduction">
        <div className="auth-brand">
          <span className="brand__mark">P</span>
          <span className="auth-brand__name">Pay<span>Point</span></span>
        </div>
        <div className="auth-intro__copy">
          <span className="auth-eyebrow">Simple. Fast. Reliable.</span>
          <h1>Run your business<br />with confidence.</h1>
          <p>Sales, inventory, customers, and reporting—everything your team needs in one place.</p>
        </div>
        <p className="auth-intro__footer">Point of sale, made beautifully simple.</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="brand__mark">P</span>
            <span className="auth-brand__name">Pay<span>Point</span></span>
          </div>
          <span className="auth-welcome">Welcome back</span>
          <h2>Sign in to your account</h2>
          <p className="auth-subtitle">Enter your details to access your workspace.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label htmlFor="email">Email address</label>
            <div className="auth-input">
              <span aria-hidden="true">@</span>
              <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
            </div>

            <label htmlFor="password">Password</label>
            <div className="auth-input">
              <span aria-hidden="true">⌑</span>
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
            </div>

            <div className="auth-options">
              <label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
              <button type="button" className="text-button">Forgot password?</button>
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="auth-support">Need help? <a href="mailto:support@paypoint.com">Contact support</a></p>
        </div>
      </section>
    </main>
  );
}
