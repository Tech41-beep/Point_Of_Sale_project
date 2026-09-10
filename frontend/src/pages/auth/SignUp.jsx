import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 8) return setError("Use at least 8 characters for your password.");
    setSaving(true); setError("");
    try {
      const response = await api.post("/auth/signup", form);
      const data = response.data;
      if (!data.success) throw new Error(data.message || "Could not create your account.");
      localStorage.setItem("authToken", data.result.token);
      localStorage.setItem("currentUser", JSON.stringify(data.result.user));
      toast.success("Welcome to PointFlow!");
      navigate("/shop", { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  return <main className="auth-page"><section className="auth-brand-panel"><div className="auth-brand-mark">P</div><p className="auth-eyebrow">POINTFLOW SHOP</p><h1>Everything your<br /><span>store has to offer.</span></h1><p className="auth-brand-copy">Create an account to browse products, place orders, and get help anytime.</p></section><section className="auth-form-panel"><div className="auth-form-wrap"><p className="auth-eyebrow">CREATE ACCOUNT</p><h2>Shop with PointFlow</h2><p className="auth-subtitle">Use your Gmail address and a secure password.</p><form onSubmit={submit}><label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label><label className="mt-4">Gmail address<input required type="email" pattern="[^\s@]+@gmail\.com" title="Use a Gmail address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@gmail.com" autoComplete="email" /></label><label className="mt-4">Password<input required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" /></label>{error && <p className="auth-error">{error}</p>}<button className="auth-submit" disabled={saving}>{saving ? "Creating account…" : "Create account"}</button></form><p className="auth-footer">Already have an account? <Link to="/signin">Sign in</Link></p></div></section></main>;
}
