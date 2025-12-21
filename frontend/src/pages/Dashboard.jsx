import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiTrendingUp, FiFolder } from 'react-icons/fi';
import Card from '../components/Common/Card';
import { projectsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsResponse = await projectsAPI.getAll();
      const projectsList = projectsResponse.data.projects || [];
      setProjects(projectsList.slice(0, 5));

      // Calculate stats
      let totalTasks = 0;
      let completedTasks = 0;
      let pendingTasks = 0;
      let allTasks = [];

      for (const project of projectsList) {
        try {
          const tasksResponse = await projectsAPI.getTasks(project.id);
          const projectTasks = tasksResponse.data.tasks || [];
          allTasks = [...allTasks, ...projectTasks];
          totalTasks += projectTasks.length;
          completedTasks += projectTasks.filter((t) => t.status === 'completed').length;
          pendingTasks += projectTasks.filter((t) => t.status !== 'completed').length;
        } catch (err) {
          console.error('Error fetching tasks for project:', err);
        }
      }

      setTasks(allTasks);
      setStats({
        totalProjects: projectsList.length,
        totalTasks,
        completedTasks,
        pendingTasks,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter((t) => t.status === taskFilter);
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProjects}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiFolder className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalTasks}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FiClock className="text-yellow-500" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completedTasks}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiCheckCircle className="text-green-500" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pendingTasks}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FiTrendingUp className="text-orange-500" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-600 text-center py-6">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(project.created_at)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* My Tasks */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {filteredTasks.length === 0 ? (
              <p className="text-gray-600 text-center py-6">
                {taskFilter === 'all' ? 'No tasks' : `No ${taskFilter.replace('_', ' ')} tasks`}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {task.priority && (
                            <span className={`inline-block px-2 py-0.5 rounded mr-2 ${
                              task.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                          Due: {task.due_date ? formatDate(task.due_date) : 'No date'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
