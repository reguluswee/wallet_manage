import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    AlertCircle
} from 'lucide-react';
import {
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    type Department
} from '../api/departmentApi';

// Department Card Component
const DepartmentCard = ({ dept, onEdit, onDelete }: {
    dept: Department;
    onEdit: (dept: Department) => void;
    onDelete: (dept: Department) => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Building2 className="h-6 w-6" />
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(dept)}
                    className="text-gray-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                >
                    <Edit2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete(dept)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.desc}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center text-gray-500 text-sm">
                <Users className="h-4 w-4 mr-2" />
                Department
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${dept.status === 'active'
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
                }`}>
                {dept.status === 'active' ? 'Active' : 'Inactive'}
            </span>
        </div>
    </motion.div>
);

// Modal Component for Create/Edit
const DepartmentModal = ({ isOpen, onClose, department, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    department: Department | null;
    onSubmit: (data: { name: string; desc: string }) => void;
}) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    useEffect(() => {
        if (department) {
            setName(department.name);
            setDesc(department.desc);
        } else {
            setName('');
            setDesc('');
        }
    }, [department, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, desc });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {department ? 'Edit Department' : 'Add Department'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                placeholder="e.g., Engineering"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                required
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                                placeholder="Brief description of this department"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 font-medium"
                            >
                                {department ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Delete Confirmation Dialog
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, departmentName }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    departmentName: string;
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                >
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 rounded-full bg-red-50">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Department</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <span className="font-semibold">{departmentName}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Main Departments Component
export const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

    // Success message
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch departments on mount
    useEffect(() => {
        const abortController = new AbortController();
        loadDepartments();

        return () => {
            abortController.abort();
        };
    }, []);

    // Filter departments based on search
    useEffect(() => {
        if (searchTerm) {
            const filtered = departments.filter(dept =>
                dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dept.desc.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments(departments);
        }
    }, [searchTerm, departments]);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchDepartments();
            setDepartments(data);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                return;
            }
            console.error('Failed to fetch departments:', err);
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: { name: string; desc: string }) => {
        try {
            await createDepartment(data);
            setIsModalOpen(false);
            setSuccessMessage('Department created successfully!');
            await loadDepartments();
        } catch (err: any) {
            console.error('Failed to create department:', err);
            setError(err.message || 'Failed to create department');
        }
    };

    const handleUpdate = async (data: { name: string; desc: string }) => {
        if (!editingDepartment) return;

        try {
            await updateDepartment({
                id: editingDepartment.id,
                ...data
            });
            setIsModalOpen(false);
            setEditingDepartment(null);
            setSuccessMessage('Department updated successfully!');
            await loadDepartments();
        } catch (err: any) {
            console.error('Failed to update department:', err);
            setError(err.message || 'Failed to update department');
        }
    };

    const handleDelete = async () => {
        if (!deletingDepartment) return;

        try {
            await deleteDepartment(deletingDepartment.id);
            setIsDeleteDialogOpen(false);
            setDeletingDepartment(null);
            setSuccessMessage('Department deleted successfully!');
            await loadDepartments();
        } catch (err: any) {
            console.error('Failed to delete department:', err);
            setError(err.message || 'Failed to delete department');
        }
    };

    const openCreateModal = () => {
        setEditingDepartment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (dept: Department) => {
        setEditingDepartment(dept);
        setIsModalOpen(true);
    };

    const openDeleteDialog = (dept: Department) => {
        setDeletingDepartment(dept);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Success Message */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
                    >
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <p className="font-medium">{successMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
                    <p className="font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your organization structure.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 text-sm font-medium"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Department
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search departments..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    <p className="mt-2 text-sm text-gray-500">Loading departments...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredDepartments.length === 0 && !error && (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No departments found' : 'No departments yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Get started by creating your first department'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Department
                        </button>
                    )}
                </div>
            )}

            {/* Department Grid */}
            {!loading && filteredDepartments.length > 0 && (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredDepartments.map((dept) => (
                            <DepartmentCard
                                key={dept.id}
                                dept={dept}
                                onEdit={openEditModal}
                                onDelete={openDeleteDialog}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Modals */}
            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDepartment(null);
                }}
                department={editingDepartment}
                onSubmit={editingDepartment ? handleUpdate : handleCreate}
            />

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingDepartment(null);
                }}
                onConfirm={handleDelete}
                departmentName={deletingDepartment?.name || ''}
            />
        </div>
    );
};
