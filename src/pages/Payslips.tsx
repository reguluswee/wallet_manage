import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    DollarSign,
    User,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { fetchPayslips, type Payslip } from '../api/payslipApi';

const Payslips = () => {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPayslips();
    }, []);

    const loadPayslips = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPayslips();
            setPayslips(data);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.msg || 'Failed to load payslips';
            setError(errorMessage);
        } finally {
            setLoading(false);
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

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            '00': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
            '01': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            '02': { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' }
        };
        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
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
                    <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
                    <p className="text-gray-500 mt-1">View and download employee payslips</p>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Pay Time
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Wallet Info
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payslips.map((payslip) => (
                                <motion.tr
                                    key={payslip.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{payslip.roll_month}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">{payslip.amount}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(payslip.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{formatDate(payslip.pay_time)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-mono">
                                            {payslip.wallet_address ?
                                                `${payslip.wallet_address.slice(0, 6)}...${payslip.wallet_address.slice(-4)}` :
                                                '-'
                                            }
                                        </div>
                                        {payslip.wallet_chain && (
                                            <div className="text-xs text-gray-500">
                                                {payslip.wallet_chain} • {payslip.wallet_type}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payslips.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payslips</h3>
                        <p className="mt-1 text-sm text-gray-500">Payslips will appear here once payroll is processed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payslips;
