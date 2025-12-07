import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Banknote,
    Plus,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    Loader2,
    Send,
    CheckCircle,
    XCircle,
    DollarSign,
    Eye
} from 'lucide-react';
import { fetchPayrolls, createPayroll, updatePayroll, deletePayroll, submitPayroll, auditPayroll, payPayroll, fetchPayrollDetail, type Payroll, type CreatePayrollRequest, type UpdatePayrollRequest, type PayrollDetailResponse } from '../api/payrollApi';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [auditStatus, setAuditStatus] = useState<'02' | '03'>('02');
    const [auditReason, setAuditReason] = useState('');
    const [formData, setFormData] = useState<CreatePayrollRequest>({
        payroll_name: '',
        payroll_desc: '',
        pay_time: ''
    });

    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        loadPayrolls();
    }, []);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            const data = await fetchPayrolls();
            setPayrolls(data);
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to load payrolls');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPayroll(formData);
            toast.success('Payroll created successfully');
            setIsCreateModalOpen(false);
            setFormData({ payroll_name: '', payroll_desc: '', pay_time: '' });
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to create payroll');
        }
    };

    const handleSubmit = async (payroll: Payroll) => {
        try {
            await submitPayroll(payroll.id);
            toast.success('Payroll submitted for audit');
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to submit payroll');
        }
    };

    const handleAudit = async () => {
        if (!selectedPayroll) return;
        try {
            await auditPayroll({
                payroll_id: selectedPayroll.id,
                status: auditStatus,
                reason: auditReason
            });
            toast.success(auditStatus === '02' ? 'Payroll approved' : 'Payroll rejected');
            setIsAuditModalOpen(false);
            setSelectedPayroll(null);
            setAuditReason('');
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to audit payroll');
        }
    };

    const handlePay = async (payroll: Payroll) => {
        if (!confirm('Are you sure you want to process payment for this payroll?')) return;
        try {
            await payPayroll(payroll.id);
            toast.success('Payment initiated successfully');
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to process payment');
        }
    };

    const openAuditModal = (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        setAuditStatus('02');
        setAuditReason('');
        setIsAuditModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { bg: string; text: string; label: string }> = {
            '00': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            '01': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Submitted' },
            '02': { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
            '03': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
            '04': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Paid' }
        };
        const config = configs[status] || configs['00'];
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
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
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-gray-500 mt-1">Create, submit, and manage employee payrolls</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Create Payroll
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Pay Time</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payrolls.map((payroll) => (
                            <motion.tr key={payroll.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{payroll.payroll_name}</p>
                                        <p className="text-xs text-gray-500">{payroll.payroll_desc}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium">{payroll.total_amount}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(payroll.status)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{payroll.pay_time}</td>
                                <td className="px-6 py-4  text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {payroll.status === '00' && (
                                            <button
                                                onClick={() => handleSubmit(payroll)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Submit for Audit"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        )}
                                        {payroll.status === '01' && (
                                            <button
                                                onClick={() => openAuditModal(payroll)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Audit"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                        )}
                                        {payroll.status === '02' && (
                                            <button
                                                onClick={() => handlePay(payroll)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                title="Pay"
                                            >
                                                <Banknote className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setIsCreateModalOpen(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">Create Payroll</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.payroll_name}
                                        onChange={(e) => setFormData({ ...formData, payroll_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={formData.payroll_desc}
                                        onChange={(e) => setFormData({ ...formData, payroll_desc: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pay Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.pay_time}
                                        onChange={(e) => setFormData({ ...formData, pay_time: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg">Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Audit Modal */}
            {isAuditModalOpen && selectedPayroll && (
                <div className="fixed inset-0 z-50">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setIsAuditModalOpen(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">Audit Payroll - {selectedPayroll.payroll_name}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Decision</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setAuditStatus('02')}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${auditStatus === '02' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                                        >
                                            <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setAuditStatus('03')}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${auditStatus === '03' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                                        >
                                            <XCircle className="h-5 w-5 mx-auto mb-1" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                                {auditStatus === '03' && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Reason</label>
                                        <textarea
                                            value={auditReason}
                                            onChange={(e) => setAuditReason(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            rows={3}
                                            placeholder="Reason for rejection..."
                                        />
                                    </div>
                                )}
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setIsAuditModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                                    <button onClick={handleAudit} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg">Submit</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollPage;
