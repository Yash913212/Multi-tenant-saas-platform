import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

type TaskForm = {
  title: string;
  description: string;
  priority: string;
};

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState<TaskForm>({ title: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const pRes = await api.get(`/projects/${projectId}`);
      setProject(pRes.data.data);
      const tRes = await api.get(`/projects/${projectId}/tasks`);
      setTasks(tRes.data.data.tasks || []);
    } catch (err) {
      setError('Failed to load project');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/tasks`, taskForm);
      setTaskForm({ title: '', description: '', priority: 'medium' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not add task');
    }
  };

  const updateStatus = async (taskId: number, status: string) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    load();
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!project) return <div className="container">Project not found</div>;

  return (
    <div className="container">
      <h2>{project.name}</h2>
      <div className="card">
        <p>{project.description}</p>
        <div className="badge badge-info">{project.status}</div>
      </div>

      <div className="card">
        <h3>Add Task</h3>
        <form onSubmit={submitTask}>
          <input className="input" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <textarea className="input" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="btn btn-primary" type="submit">Add Task</button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <h3>Tasks</h3>
        {tasks.length === 0 && <div>No tasks yet.</div>}
        {tasks.map((t: any) => (
          <div key={t.id} style={{ marginBottom: '0.6rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div>{t.description}</div>
            <div className="badge badge-info">{t.status}</div> <div className="badge badge-warning">{t.priority}</div>
            <div className="flex">
              {['todo', 'in_progress', 'completed'].map((s) => (
                <button key={s} className="btn btn-secondary" onClick={() => updateStatus(t.id, s)} disabled={t.status === s}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;