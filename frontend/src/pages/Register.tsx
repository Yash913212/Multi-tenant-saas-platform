import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

type RegisterForm = {
  tenantName: string;
  subdomain: string;
  adminEmail: string;
  adminFullName: string;
  adminPassword: string;
};

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({ tenantName: '', subdomain: '', adminEmail: '', adminFullName: '', adminPassword: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agree) return setError('Please accept terms');
    try {
      setLoading(true);
      await api.post('/auth/register-tenant', form);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2>Register Tenant</h2>
      <div className="card">
        <form onSubmit={submit}>
          <label>Organization Name</label>
          <input className="input" name="tenantName" value={form.tenantName} onChange={handleChange} required />
          <label>Subdomain</label>
          <input className="input" name="subdomain" value={form.subdomain} onChange={handleChange} required placeholder="acme" />
          <small>Preview: {form.subdomain || 'your-subdomain'}.yourapp.com</small>
          <label>Admin Email</label>
          <input className="input" type="email" name="adminEmail" value={form.adminEmail} onChange={handleChange} required />
          <label>Admin Full Name</label>
          <input className="input" name="adminFullName" value={form.adminFullName} onChange={handleChange} required />
          <label>Password</label>
          <input className="input" type="password" name="adminPassword" value={form.adminPassword} onChange={handleChange} required />
          <div style={{ margin: '0.5rem 0' }}>
            <label>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to terms
            </label>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <div style={{ marginTop: '0.5rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;