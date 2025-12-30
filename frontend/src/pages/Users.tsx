import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

type UserForm = {
  email: string;
  fullName: string;
  password: string;
  role: string;
};

const Users: React.FC = () => {
  const { user } = useAuth();
  const tenantId = (user as any)?.tenant?.id || user?.tenantId;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<UserForm>({ email: '', fullName: '', password: '', role: 'user' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${tenantId}/users`);
      setUsers(res.data.data.users || []);
    } catch (err) {
      setError('Failed to load users');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (tenantId) load(); }, [tenantId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/tenants/${tenantId}/users`, form);
      setForm({ email: '', fullName: '', password: '', role: 'user' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  if (user?.role !== 'tenant_admin' && user?.role !== 'super_admin') {
    return <div className="container">Unauthorized</div>;
  }

  return (
    <div className="container">
      <h2>Users</h2>
      <div className="card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{users.length} users</div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'Add User'}</button>
        </div>
        {showForm && (
          <form onSubmit={submit}>
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        )}
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td><span className="badge badge-info">{u.role}</span></td>
              <td>{u.isActive ? 'Active' : 'Inactive'}</td>
              <td><button className="btn btn-secondary" onClick={() => remove(u.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;