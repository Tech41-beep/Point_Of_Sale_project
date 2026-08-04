import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from './auth.api';
import { useAuth } from '../../app/providers/AuthProvider';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(form);
      login(response?.result?.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Sign in</h2>
      <p>Access your Point of Sale workspace.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
