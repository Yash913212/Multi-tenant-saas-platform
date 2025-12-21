import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import TaskForm from '../components/Forms/TaskForm';
import ProjectForm from '../components/Forms/ProjectForm';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getTasks(id),
        usersAPI.getAll(),
      ]);

      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
      setUsers(usersRes.data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      setFormLoading(true);
      await tasksAPI.create(formData);
      setTaskModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      setFormLoading(true);
      await tasksAPI.update(editingTask.id, formData);
      setTaskModalOpen(false);
      setEditingTask(null);
      await fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setFormLoading(true);
      await tasksAPI.delete(taskId);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChangeTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.changeStatus(taskId, newStatus);
      await fetchData();
    } catch (err) {
      console.error('Error changing task status:', err);
      setError(err.response?.data?.message || 'Failed to change task status');
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setFormLoading(true);
      await projectsAPI.update(id, formData);
      setProjectModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      setFormLoading(true);
      await projectsAPI.delete(id);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setFormLoading(false);
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
          >
            <FiArrowLeft size={20} />
            Back to Projects
          </button>
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">Project not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft size={20} />
          Back to Projects
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Project Header */}
        <Card className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectModalOpen(true)}
              >
                <FiEdit2 size={18} />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteConfirm('project')}
              >
                <FiTrash2 size={18} />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              project.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : project.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status?.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              Created: {formatDate(project.created_at)}
            </span>
          </div>
        </Card>

        {/* Tasks Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <Button
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <FiPlus size={18} />
              Add Task
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </Card>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No tasks found matching your filters'
                  : 'No tasks yet. Add one to get started!'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
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
                      {task.due_date && (
                        <span className="text-xs text-gray-600">
                          Due: {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.assigned_to_id && (
                        <span className="text-xs text-gray-600">
                          Assigned to: {users.find(u => u.id === task.assigned_to_id)?.full_name || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setTaskModalOpen(true);
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(task.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask}
          projectId={id}
          users={users}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          isLoading={formLoading}
        />
      </Modal>

      {/* Project Modal */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="Edit Project"
      >
        <ProjectForm
          project={project}
          onSubmit={handleUpdateProject}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title={deleteConfirm === 'project' ? 'Delete Project' : 'Delete Task'}
        >
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this {deleteConfirm === 'project' ? 'project' : 'task'}?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={formLoading}
              onClick={() => {
                if (deleteConfirm === 'project') {
                  handleDeleteProject();
                } else {
                  handleDeleteTask(deleteConfirm);
                }
              }}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={formLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetails;
