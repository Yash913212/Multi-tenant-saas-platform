import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

type LoginForm = {
  email: string;
  password: string;
  tenantSubdomain: string;
};

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', tenantSubdomain: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await api.post('/auth/login', form);
      const data = res.data.data;
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 420, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>
        {location.state && (location.state as any).registered && <div className="card" style={{ background: '#ecfdf3', marginBottom: '1rem' }}>Registration successful. Please login.</div>}
        <div className="card">
          <form onSubmit={submit}>
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
            <label>Tenant Subdomain (Optional)</label>
            <input className="input" name="tenantSubdomain" value={form.tenantSubdomain} onChange={handleChange} placeholder="demo" />
            {error && <div className="error">{error}</div>}
            <button className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>{loading ? 'Signing in...' : 'Login'}</button>
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            New here? <Link to="/register">Register tenant</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;