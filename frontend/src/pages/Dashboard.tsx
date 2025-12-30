import React, { useEffect, useState } from 'react';
import api from '../api';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await api.get('/projects');
        setProjects(projRes.data.data.projects || []);
        const myTasks: any[] = [];
        for (const p of projRes.data.data.projects || []) {
          if (myTasks.length >= 10) break;
          const tRes = await api.get(`/projects/${p.id}/tasks`, { params: { assignedTo: user?.id, limit: 5 } });
          myTasks.push(...tRes.data.data.tasks);
        }
        setTasks(myTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (loading) return <div className="container">Loading dashboard...</div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div>
      <div className="container">
        <h2>Dashboard</h2>
        <div className="grid grid-2">
          <StatCard title="Total Projects" value={projects.length} accent="#2563eb" />
          <StatCard title="My Tasks" value={totalTasks} accent="#16a34a" />
          <StatCard title="Completed Tasks" value={completedTasks} accent="#f59e0b" />
          <StatCard title="Pending Tasks" value={pendingTasks} accent="#ef4444" />
        </div>

        <div className="card">
          <h3>Recent Projects</h3>
          {projects.slice(0, 5).map((p: any) => (
            <div key={p.id} style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{p.description}</div>
              <div className="badge badge-info">{p.status}</div>
              <div>Tasks: {p.taskCount} (Done: {p.completedTaskCount})</div>
            </div>
          ))}
          {projects.length === 0 && <div>No projects yet.</div>}
          <div style={{ marginTop: '0.5rem' }}><Link to="/projects">View all projects →</Link></div>
        </div>

        <div className="card">
          <h3>My Tasks</h3>
          {tasks.length === 0 && <div>No tasks assigned.</div>}
          {tasks.map((t: any) => (
            <div key={t.id} style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontWeight: 600 }}>{t.title}</div>
              <div className="badge badge-info">{t.status}</div>
              <div className="badge badge-warning">{t.priority}</div>
              {t.dueDate && <div>Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;