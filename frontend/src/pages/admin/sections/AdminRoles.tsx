import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../../contexts/ToastContext';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

export default function AdminRoles() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full access to all features and settings',
      permissions: ['all'],
      usersCount: 1,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Access to most features except system settings',
      permissions: ['users', 'orders', 'disputes', 'reports'],
      usersCount: 3,
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      name: 'Support',
      description: 'Access to customer support and dispute resolution',
      permissions: ['disputes', 'users'],
      usersCount: 5,
      createdAt: '2024-01-01',
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: [],
  });

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole(role);
    setIsEditing(true);
  };

  const handleSaveRole = () => {
    if (!newRole.name || !newRole.description) {
      showToast('Please fill in all required fields' as ToastType, 'error');
      return;
    }

    if (isEditing && selectedRole) {
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? { ...role, ...newRole } : role
      ));
      showToast('Role updated successfully' as ToastType, 'success');
    } else {
      const newRoleWithId = {
        ...newRole,
        id: Date.now().toString(),
        usersCount: 0,
        createdAt: new Date().toISOString(),
      } as Role;
      setRoles([...roles, newRoleWithId]);
      showToast('Role created successfully' as ToastType, 'success');
    }

    setIsEditing(false);
    setSelectedRole(null);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    if (!roleToDelete) {
      showToast('Role not found' as ToastType, 'error');
      return;
    }
    if (roleToDelete.usersCount > 0) {
      showToast('Cannot delete role with assigned users' as ToastType, 'error');
      return;
    }
    setRoles(roles.filter(role => role.id !== roleId));
    showToast('Role deleted successfully' as ToastType, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            setIsEditing(false);
            setSelectedRole(null);
            setNewRole({ name: '', description: '', permissions: [] });
          }}
        >
          Add New Role
        </motion.button>
      </div>

      {/* Role List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {role.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {role.usersCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(role.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Modal */}
      {(isEditing || selectedRole === null) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRole({ ...newRole, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewRole({ ...newRole, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
                </label>
                <div className="mt-2 space-y-2">
                  {['users', 'orders', 'disputes', 'reports', 'settings'].map((permission) => (
                    <label key={permission} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={newRole.permissions?.includes(permission)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const permissions = newRole.permissions || [];
                          if (e.target.checked) {
                            setNewRole({ ...newRole, permissions: [...permissions, permission] });
                          } else {
                            setNewRole({
                              ...newRole,
                              permissions: permissions.filter((p) => p !== permission),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedRole(null);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isEditing ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 