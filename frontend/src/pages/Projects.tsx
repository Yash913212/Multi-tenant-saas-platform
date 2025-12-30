import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

type ProjectForm = {
  name: string;
  description: string;
  status: string;
};

type ProjectFilters = {
  status: string;
  search: string;
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({ status: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>({ name: '', description: '', status: 'active' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', { params: filters });
      setProjects(res.data.data.projects || []);
    } catch (err) {
      setError('Failed to load projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters.status, filters.search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setShowForm(false);
      setForm({ name: '', description: '', status: 'active' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete project?')) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  return (
    <div className="container">
      <h2>Projects</h2>
      <div className="card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex">
            <input className="input" placeholder="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : 'Create New Project'}</button>
        </div>
        {showForm && (
          <form onSubmit={submit}>
            <input className="input" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        )}
      </div>

      {loading && <div>Loading projects...</div>}
      {error && <div className="error">{error}</div>}

      <div className="grid grid-2">
        {projects.map((p: any) => (
          <div className="card" key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ color: '#6b7280' }}>{p.description}</div>
              </div>
              <div className="badge badge-info">{p.status}</div>
            </div>
            <div style={{ margin: '0.4rem 0' }}>Tasks: {p.taskCount} | Done: {p.completedTaskCount}</div>
            <div className="flex" style={{ justifyContent: 'flex-end' }}>
              <Link className="btn btn-secondary" to={`/projects/${p.id}`}>View</Link>
              <button className="btn btn-secondary" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && <div>No projects found.</div>}
    </div>
  );
};

export default Projects;