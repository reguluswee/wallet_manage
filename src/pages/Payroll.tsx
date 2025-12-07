import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Banknote,
    Plus,
    Loader2,
    Send,
    CheckCircle,
    XCircle,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { fetchPayrolls, createPayroll, submitPayroll, auditPayroll, payPayroll, type Payroll, type CreatePayrollRequest, type AuditRequest } from '../api/payrollApi';
import { useToast } from '../contexts/ToastContext';

// Status helper functions
const getStatusBadge = (flag: number, status?: string) => {
    // Backend status strings have priority
    const statusMap: Record<string, { label: string, className: string }> = {
        'create': { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
        'waiting_approval': { label: 'Pending', className: 'bg-blue-100 text-blue-700' },
        'approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
        'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        'paid': { label: 'Paid', className: 'bg-purple-100 text-purple-700' },
        'paying': { label: 'Paying', className: 'bg-indigo-100 text-indigo-700' }
    };

    // Use status string if available
    if (status && statusMap[status]) {
        const st = statusMap[status];
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${st.className}`}>
                {st.label}
            </span>
        );
    }

    // Otherwise fall back to flag number
    const flagStatusMap = {
        0: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
        1: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
        2: { label: 'Approved', className: 'bg-green-100 text-green-700' },
        3: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        4: { label: 'Paid', className: 'bg-purple-100 text-purple-700' }
    };
    const st = flagStatusMap[flag as keyof typeof flagStatusMap] || flagStatusMap[0];
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${st.className}`}>
            {st.label}
        </span>
    );
};

const PayrollPage = () => {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isConfirmPayModalOpen, setIsConfirmPayModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [auditFlag, setAuditFlag] = useState<2 | 3>(2);
    const [auditReason, setAuditReason] = useState('');
    const [formData, setFormData] = useState<CreatePayrollRequest>({
        roll_month: '',
        desc: ''
    });

    const toast = useToast();

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
            setFormData({ roll_month: '', desc: '' });
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
                id: selectedPayroll.id,
                flag: auditFlag,
                desc: auditReason
            });
            toast.success(auditFlag === 2 ? 'Payroll approved' : 'Payroll rejected');
            setIsAuditModalOpen(false);
            setSelectedPayroll(null);
            setAuditReason('');
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to audit payroll');
        }
    };

    const handlePay = async () => {
        if (!selectedPayroll) return;
        try {
            await payPayroll(selectedPayroll.id);
            toast.success('Payment initiated successfully');
            setIsConfirmPayModalOpen(false);
            setSelectedPayroll(null);
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to process payment');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '0001-01-01T00:00:00Z') return '-';
        return new Date(dateString).toLocaleString();
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Time</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payrolls.map((payroll) => (
                                <tr key={payroll.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {payroll.roll_month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payroll.total_amount} {payroll.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(payroll.flag, payroll.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(payroll.pay_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {/* Draft/Create: Show Submit button */}
                                        {(payroll.status === 'create' || (!payroll.status && payroll.flag === 0)) && (
                                            <button
                                                onClick={() => handleSubmit(payroll)}
                                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                            >
                                                <Send className="h-4 w-4 mr-1" />
                                                Submit
                                            </button>
                                        )}

                                        {/* Waiting Approval: Show Audit button */}
                                        {(payroll.status === 'waiting_approval' || payroll.flag === 1) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPayroll(payroll);
                                                    setIsAuditModalOpen(true);
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Audit
                                            </button>
                                        )}

                                        {/* Approved: Show Pay button */}
                                        {(payroll.status === 'approved' || payroll.flag === 2) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedPayroll(payroll);
                                                    setIsConfirmPayModalOpen(true);
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                            >
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Pay
                                            </button>
                                        )}

                                        {/* Rejected, Paid, or Paying: No action button */}
                                        {(payroll.status === 'rejected' || payroll.status === 'paid' || payroll.status === 'paying' || payroll.flag === 3 || payroll.flag === 4) && (
                                            <span className="text-gray-400 text-xs italic">
                                                {payroll.status === 'paid' || payroll.flag === 4 ? 'Completed' :
                                                    payroll.status === 'paying' ? 'Processing...' : 'No actions available'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {payrolls.length === 0 && (
                    <div className="text-center py-12">
                        <Banknote className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payrolls</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new payroll.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Create Payroll</h3>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Roll Month (YYYY-MM)
                                </label>
                                <input
                                    type="month"
                                    value={formData.roll_month}
                                    onChange={(e) => setFormData({ ...formData, roll_month: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.desc}
                                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Audit Modal */}
            {isAuditModalOpen && selectedPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Audit Payroll</h3>
                            <p className="text-sm text-gray-500 mt-1">{selectedPayroll.roll_month}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setAuditFlag(2)}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${auditFlag === 2
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => setAuditFlag(3)}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${auditFlag === 3
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <XCircle className="h-5 w-5 mx-auto mb-1" />
                                    Reject
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {auditFlag === 3 ? 'Reason for Rejection' : 'Comments (Optional)'}
                                </label>
                                <textarea
                                    value={auditReason}
                                    onChange={(e) => setAuditReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                    placeholder={auditFlag === 3 ? 'Please provide a reason...' : 'Optional comments...'}
                                    required={auditFlag === 3}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsAuditModalOpen(false);
                                        setSelectedPayroll(null);
                                        setAuditReason('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAudit}
                                    className={`px-4 py-2 text-white rounded-lg ${auditFlag === 2
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {auditFlag === 2 ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {isConfirmPayModalOpen && selectedPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Confirm Payment</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Process payroll payment</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Important</p>
                                        <p>Are you sure you want to process payment for this payroll?</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Month:</span>
                                    <span className="font-medium text-gray-900">{selectedPayroll.roll_month}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-medium text-gray-900">{selectedPayroll.total_amount} {selectedPayroll.currency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    setIsConfirmPayModalOpen(false);
                                    setSelectedPayroll(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePay}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <DollarSign className="h-4 w-4" />
                                Confirm Payment
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PayrollPage;
