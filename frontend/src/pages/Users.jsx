import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle } from 'react-icons/fi';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import UserForm from '../components/Forms/UserForm';
import { useAuth } from '../hooks/useAuth';
import { tenantsAPI, usersAPI } from '../services/api';
import { ROLES } from '../utils/constants';
import { formatDate } from '../utils/helpers';

export const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Check if user is tenant_admin
  const isTenantAdmin = user?.role === ROLES.TENANT_ADMIN;

  useEffect(() => {
    if (isTenantAdmin) {
      fetchUsers();
    }
  }, [isTenantAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (user?.tenant_id) {
        const response = await tenantsAPI.getUsers(user.tenant_id);
        setUsers(response.data.users || []);
      } else {
        const response = await usersAPI.getAll();
        setUsers(response.data.users || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      setFormLoading(true);
      if (user?.tenant_id) {
        await tenantsAPI.addUser(user.tenant_id, formData);
      } else {
        // Fallback if tenant_id not available
        console.error('Tenant ID not available');
      }
      setModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      setFormLoading(true);
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password;
      }
      await usersAPI.update(editingUser.id, updateData);
      setModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setFormLoading(true);
      await usersAPI.delete(id);
      await fetchUsers();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return users.filter((usr) => {
      const matchesSearch =
        usr.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usr.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || usr.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (!isTenantAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12">
            <FiAlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
            <p className="text-gray-600 text-lg font-semibold">Access Denied</p>
            <p className="text-gray-600 mt-2">
              Only tenant administrators can manage users.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <Button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <FiPlus size={18} />
            Add User
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value={ROLES.USER}>User</option>
              <option value={ROLES.MANAGER}>Manager</option>
              <option value={ROLES.TENANT_ADMIN}>Admin</option>
            </select>
          </div>
        </Card>

        {/* Users Table */}
        {paginatedUsers.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchTerm || roleFilter !== 'all'
                ? 'No users found matching your criteria'
                : 'No users yet. Add one to get started!'}
            </p>
          </Card>
        ) : (
          <>
            <Card className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Full Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((usr) => (
                    <tr key={usr.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{usr.full_name}</td>
                      <td className="py-3 px-4 text-gray-600">{usr.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          usr.role === ROLES.TENANT_ADMIN
                            ? 'bg-red-100 text-red-800'
                            : usr.role === ROLES.MANAGER
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          usr.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(usr.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(usr);
                              setModalOpen(true);
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Edit user"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(usr.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete user"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Delete User"
        >
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={formLoading}
              onClick={() => handleDeleteUser(deleteConfirm)}
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

export default Users;
