import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from './auth.api';
import { useAuth } from '../../app/providers/AuthProvider';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
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
      const response = await registerUser(form);
      login(response?.result?.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Create account</h2>
      <p>Set up a new user for the POS system.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
