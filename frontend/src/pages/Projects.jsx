import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import ProjectForm from '../components/Forms/ProjectForm';
import { projectsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data.projects || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      setFormLoading(true);
      await projectsAPI.create(formData);
      setModalOpen(false);
      setEditingProject(null);
      await fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setFormLoading(true);
      await projectsAPI.update(editingProject.id, formData);
      setModalOpen(false);
      setEditingProject(null);
      await fetchProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      setFormLoading(true);
      await projectsAPI.delete(id);
      await fetchProjects();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setFormLoading(false);
    }
  };

  const getFilteredProjects = () => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <Button
            onClick={() => {
              setEditingProject(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <FiPlus size={18} />
            Create Project
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchTerm || statusFilter !== 'all'
                ? 'No projects found matching your criteria'
                : 'No projects yet. Create one to get started!'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h2>
                <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                  {project.description || 'No description'}
                </p>

                <div className="space-y-3 mb-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded font-semibold text-xs ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center text-sm font-semibold"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setModalOpen(true);
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Project"
        >
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={formLoading}
              onClick={() => handleDeleteProject(deleteConfirm)}
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

export default Projects;
