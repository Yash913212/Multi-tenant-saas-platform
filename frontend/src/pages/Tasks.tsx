import React, { useEffect, useState } from 'react';
import api from '../api';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/projects');
      const collected: any[] = [];
      for (const p of projRes.data.data.projects || []) {
        const tRes = await api.get(`/projects/${p.id}/tasks`);
        collected.push(...tRes.data.data.tasks.map((t: any) => ({ ...t, projectName: p.name })));
      }
      setTasks(collected);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="container">Loading tasks...</div>;

  return (
    <div className="container">
      <h2>Tasks</h2>
      <div className="card">
        {tasks.length === 0 && <div>No tasks available.</div>}
        {tasks.map((t) => (
          <div key={t.id} style={{ marginBottom: '0.6rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div>{t.description}</div>
            <div>Project: {t.projectName}</div>
            <div className="badge badge-info">{t.status}</div> <div className="badge badge-warning">{t.priority}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;