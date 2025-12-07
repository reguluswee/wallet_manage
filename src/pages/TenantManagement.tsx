import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Server,
    Plus,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    Eye,
    Copy,
    Check,
    Loader2
} from 'lucide-react';
import { fetchTenants, createTenant, updateTenant, deleteTenant, getTenantDetail, type Tenant, type CreateTenantRequest, type UpdateTenantRequest, type TenantDetailResponse } from '../api/tenantApi';

const TenantManagement = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [tenantDetail, setTenantDetail] = useState<TenantDetailResponse | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateTenantRequest>({
        unique_id: '',
        name: '',
        desc: '',
        callback: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const data = await fetchTenants();
            setTenants(data);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || 'Failed to load tenants';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTenant(formData);
            alert('Tenant created successfully');
            setIsCreateModalOpen(false);
            setFormData({ unique_id: '', name: '', desc: '', callback: '' });
            loadTenants();
        } catch (err: any) {
            const errorMessage = err.response?.data?.msg || 'Failed to create tenant';
            setError(errorMessage);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;

        try {
            const updateData: UpdateTenantRequest = {
                id: selectedTenant.id,
                unique_id: formData.unique_id,
                name: formData.name,
                desc: formData.desc,
                callback: formData.callback
            };
            await updateTenant(updateData);
            alert('Tenant updated successfully');
            setIsEditModalOpen(false);
            setSelectedTenant(null);
            setFormData({ unique_id: '', name: '', desc: '', callback: '' });
            loadTenants();
        } catch (err: any) {
            const errorMessage = err.response?.data?.msg || 'Failed to update tenant';
            setError(errorMessage);
        }
    };

    const handleDelete = async () => {
        if (!selectedTenant) return;

        try {
            await deleteTenant(selectedTenant.id);
            alert('Tenant deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedTenant(null);
            loadTenants();
        } catch (err: any) {
            const errorMessage = err.response?.data?.msg || 'Failed to delete tenant';
            setError(errorMessage);
        }
    };

    const openEditModal = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setFormData({
            unique_id: tenant.unique_id || '',
            name: tenant.name,
            desc: tenant.desc || '',
            callback: tenant.call_back || ''
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setIsDeleteModalOpen(true);
    };

    const openDetailModal = async (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setIsDetailModalOpen(true);
        try {
            const detail = await getTenantDetail(tenant.id);
            setTenantDetail(detail);
        } catch (err: any) {
            const errorMessage = err.response?.data?.msg || 'Failed to load tenant details';
            setError(errorMessage);
            setIsDetailModalOpen(false);
        }
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedTenant(null);
        setTenantDetail(null);
        setCopiedField(null);
        setFormData({ unique_id: '', name: '', desc: '', callback: '' });
        setError(null);
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            alert('Failed to copy to clipboard');
        }
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
                    <p className="text-gray-500 mt-1">Manage system tenants and configurations</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Create Tenant
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Unique ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Callback URL
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Created Time
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tenants.map((tenant) => (
                                <motion.tr
                                    key={tenant.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Server className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{tenant.unique_id || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{tenant.desc || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <span className="text-sm text-gray-600 truncate block">{tenant.call_back || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">{formatDate(tenant.add_time)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => openDetailModal(tenant)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(tenant)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(tenant)}
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
                {tenants.length === 0 && (
                    <div className="text-center py-12 bg-gray-50">
                        <Server className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new tenant.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
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
                                <h2 className="text-xl font-bold text-gray-900">Create Tenant</h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unique ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.unique_id}
                                        onChange={(e) => setFormData({ ...formData, unique_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter unique identifier"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter tenant name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.desc}
                                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Enter description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
                                    <input
                                        type="url"
                                        value={formData.callback}
                                        onChange={(e) => setFormData({ ...formData, callback: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://example.com/callback"
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

            {/* Edit Modal */}
            {isEditModalOpen && selectedTenant && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Edit Tenant</h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unique ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.unique_id}
                                        onChange={(e) => setFormData({ ...formData, unique_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter unique identifier"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter tenant name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.desc}
                                        onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Enter description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
                                    <input
                                        type="url"
                                        value={formData.callback}
                                        onChange={(e) => setFormData({ ...formData, callback: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://example.com/callback"
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
                                        Update
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedTenant && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Delete Tenant</h2>
                                    <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete tenant <strong>{selectedTenant.name}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeModals}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedTenant && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={closeModals}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Tenant Details</h2>
                                <button onClick={closeModals} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {tenantDetail ? (
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Basic Information</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-500">Name:</span>
                                                <span className="text-sm font-medium text-gray-900">{tenantDetail.tenant.name}</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-500">Unique ID:</span>
                                                <span className="text-sm font-medium text-gray-900">{tenantDetail.tenant.unique_id}</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-500">Description:</span>
                                                <span className="text-sm font-medium text-gray-900">{tenantDetail.tenant.desc || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-500">Callback URL:</span>
                                                <span className="text-sm font-medium text-gray-900 break-all">{tenantDetail.tenant.call_back || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* API Credentials */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            API Credentials (Sensitive)
                                        </h3>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium text-gray-700">App ID</label>
                                                    <button
                                                        onClick={() => copyToClipboard(tenantDetail.api.app_id, 'app_id')}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        {copiedField === 'app_id' ? (
                                                            <><Check className="h-3 w-3" /> Copied</>
                                                        ) : (
                                                            <><Copy className="h-3 w-3" /> Copy</>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm text-gray-900 break-all">
                                                    {tenantDetail.api.app_id}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium text-gray-700">App Key</label>
                                                    <button
                                                        onClick={() => copyToClipboard(tenantDetail.api.app_key, 'app_key')}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        {copiedField === 'app_key' ? (
                                                            <><Check className="h-3 w-3" /> Copied</>
                                                        ) : (
                                                            <><Copy className="h-3 w-3" /> Copy</>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm text-gray-900 break-all">
                                                    {tenantDetail.api.app_key}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-3 bg-yellow-100 rounded-lg">
                                                <AlertCircle className="h-4 w-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-yellow-800">
                                                    Keep these credentials secure. Do not share them publicly or commit them to version control.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
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

export default TenantManagement;
