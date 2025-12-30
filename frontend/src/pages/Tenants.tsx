import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const planOptions = [
  { value: '', label: 'All plans' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' }
];

const statusOptions = [
  { value: '', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'trial', label: 'Trial' }
];

const Tenants: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<any>({ currentPage: 1, totalPages: 1, totalTenants: 0 });

  const queryParams = useMemo(() => ({
    page,
    limit,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(planFilter ? { subscriptionPlan: planFilter } : {})
  }), [page, limit, statusFilter, planFilter]);

  const load = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.get('/tenants', { params: queryParams });
      const payload = res.data?.data || {};
      setTenants(payload.tenants || []);
      setPagination(payload.pagination || { currentPage: page, totalPages: 1, totalTenants: 0 });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load tenants';
      setError(message);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [queryParams]);

  if (user?.role !== 'super_admin') return <div className="container">Unauthorized</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2>Tenants</h2>
        <div className="filters">
          <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={planFilter} onChange={(e) => { setPage(1); setPlanFilter(e.target.value); }}>
            {planOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="muted">Loading tenants...</div>
      ) : tenants.length === 0 ? (
        <div className="muted">No tenants found</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subdomain</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Users</th>
                <th>Projects</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.subdomain}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td><span className="badge badge-neutral">{t.subscriptionPlan}</span></td>
                  <td>{t.totalUsers}</td>
                  <td>{t.totalProjects}</td>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
        <span>
          Page {pagination.currentPage || page} of {pagination.totalPages || 1} ({pagination.totalTenants || tenants.length} tenants)
        </span>
        <button
          disabled={loading || (pagination.totalPages ? page >= pagination.totalPages : tenants.length < limit)}
          onClick={() => setPage((p) => p + 1)}
        >Next</button>
      </div>
    </div>
  );
};

export default Tenants;