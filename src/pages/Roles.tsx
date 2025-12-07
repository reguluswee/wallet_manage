import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    Loader2,
    Users,
    Lock,
    Check
} from 'lucide-react';
import { fetchRoles, createRole, updateRole, deleteRole, type Role, type CreateRoleRequest, type UpdateRoleRequest } from '../api/roleApi';
import { fetchFunctions, fetchRoleFunctions, fetchRoleUsers, bindFunctionToRole, unbindFunctionFromRole, bindUserToRole, unbindUserFromRole, type Func } from '../api/rbacApi';
import { fetchUsers, type User } from '../api/userApi';
import { useToast } from '../contexts/ToastContext';

const Roles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFuncModalOpen, setIsFuncModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<CreateRoleRequest>({
        name: '',
        desc: ''
    });

    // Permission management state
    const [allFuncs, setAllFuncs] = useState<Func[]>([]);
    const [roleFuncs, setRoleFuncs] = useState<Func[]>([]);
    const [loadingFuncs, setLoadingFuncs] = useState(false);

    // User assignment state
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roleUsers, setRoleUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const toast = useToast();

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const data = await fetchRoles();
            setRoles(data);
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRole(formData);
            toast.success('Role created successfully');
            setIsCreateModalOpen(false);
            setFormData({ name: '', desc: '' });
            loadRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to create role');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        try {
            const updateData: UpdateRoleRequest = {
                id: selectedRole.id,
                name: formData.name,
                desc: formData.desc
            };
            await updateRole(updateData);
            toast.success('Role updated successfully');
            setIsEditModalOpen(false);
            setSelectedRole(null);
            setFormData({ name: '', desc: '' });
            loadRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to update role');
        }
    };

    const handleDelete = async () => {
        if (!selectedRole) return;

        try {
            await deleteRole(selectedRole.id);
            toast.success('Role deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
            loadRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to delete role');
        }
    };

    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        setFormData({
            name: role.role_name,
            desc: role.role_desc || ''
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const openFuncModal = async (role: Role) => {
        setSelectedRole(role);
        setIsFuncModalOpen(true);
        setLoadingFuncs(true);

        try {
            const [all, assigned] = await Promise.all([
                fetchFunctions(),
                fetchRoleFunctions(role.id)
            ]);

            console.log('All functions:', all);
            console.log('Assigned functions for role', role.id, ':', assigned);
            console.log('Assigned IDs:', assigned.map(f => f.id));

            setAllFuncs(all);
            setRoleFuncs(assigned);
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to load functions');
        } finally {
            setLoadingFuncs(false);
        }
    };

    const openUserModal = async (role: Role) => {
        setSelectedRole(role);
        setIsUserModalOpen(true);
        setLoadingUsers(true);

        try {
            const [all, assigned] = await Promise.all([
                fetchUsers(),
                fetchRoleUsers(role.id)
            ]);
            setAllUsers(all);
            setRoleUsers(assigned);
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleFunc = async (func: Func) => {
        if (!selectedRole) return;

        const isAssigned = roleFuncs.some(f => f.id === func.id);
        try {
            if (isAssigned) {
                await unbindFunctionFromRole(selectedRole.id, func.id);
                setRoleFuncs(roleFuncs.filter(f => f.id !== func.id));
                toast.success('Permission removed');
            } else {
                await bindFunctionToRole(selectedRole.id, func.id);
                setRoleFuncs([...roleFuncs, func]);
                toast.success('Permission added');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to update permission');
        }
    };

    const toggleUser = async (user: User) => {
        if (!selectedRole) return;

        const isAssigned = roleUsers.some(u => u.id === user.id);
        try {
            if (isAssigned) {
                await unbindUserFromRole(selectedRole.id, user.id);
                setRoleUsers(roleUsers.filter(u => u.id !== user.id));
                toast.success('User removed from role');
            } else {
                await bindUserToRole(selectedRole.id, user.id);
                setRoleUsers([...roleUsers, user]);
                toast.success('User assigned to role');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to update user assignment');
        }
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsFuncModalOpen(false);
        setIsUserModalOpen(false);
        setSelectedRole(null);
        setFormData({ name: '', desc: '' });
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString.startsWith('0001')) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-500 mt-1">Manage user roles and access permissions</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Create Role
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Role Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Created Time
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roles.map((role) => (
                                <motion.tr
                                    key={role.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <Shield className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{role.role_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{role.role_desc || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">{formatDate(role.add_time)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openFuncModal(role)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Assign Permissions"
                                            >
                                                <Lock className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openUserModal(role)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Assign Users"
                                            >
                                                <Users className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(role)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(role)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {roles.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50">
                        <Shield className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
                    </div>
                )}
            </div>

            {/* Create Modal - Same as before */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Create Role</h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter role name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.desc}
                                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Enter role description"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Edit/Delete Modals - Similar to Create, omitted for brevity */}

            {/* Function Assignment Modal */}
            {isFuncModalOpen && selectedRole && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Assign Permissions - {selectedRole.role_name}
                                </h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            {loadingFuncs ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {allFuncs.map((func) => {
                                        const isAssigned = roleFuncs.some(f => f.id === func.id);

                                        // Debug log for first few items
                                        if (func.id <= 3) {
                                            console.log(`Func ${func.id} (${func.func_name}):`, {
                                                funcId: func.id,
                                                funcIdType: typeof func.id,
                                                isAssigned,
                                                roleFuncsIds: roleFuncs.map(f => ({ id: f.id, type: typeof f.id }))
                                            });
                                        }

                                        return (
                                            <div
                                                key={func.id}
                                                onClick={() => toggleFunc(func)}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isAssigned ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isAssigned ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                                                    }`}>
                                                    {isAssigned && <Check className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{func.func_name}</p>
                                                    <p className="text-xs text-gray-500">{func.func_desc}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{func.func_group}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-6">
                                <button
                                    onClick={closeModals}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* User Assignment Modal */}
            {isUserModalOpen && selectedRole && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Assign Users - {selectedRole.role_name}
                                </h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            {loadingUsers ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {allUsers.map((user) => {
                                        const isAssigned = roleUsers.some(u => u.id === user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => toggleUser(user)}
                                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isAssigned ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isAssigned ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'
                                                    }`}>
                                                    {isAssigned && <Check className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="mt-6">
                                <button
                                    onClick={closeModals}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
