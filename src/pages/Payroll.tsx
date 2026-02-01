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
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useSwitchChain, useConfig } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { waitForTransactionReceipt, readContract } from '@wagmi/core';
import {
    fetchPayrolls,
    createPayroll,
    submitPayroll,
    auditPayroll,
    payPayroll,
    checkPayrollStatus,
    fetchPayConfig,
    type Payroll,
    type CreatePayrollRequest
} from '../api/payrollApi';
import { useToast } from '../contexts/ToastContext';
import PayrollDetailDrawer from './PayrollDetailDrawer';

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
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isConfirmPayModalOpen, setIsConfirmPayModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [auditOp, setAuditOp] = useState<'approve' | 'reject'>('approve');
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
            await createPayroll({
                ...formData,
                roll_month: formData.roll_month.replace(/-/g, '')
            });
            toast.success('Payroll created successfully');
            setIsCreateModalOpen(false);
            setFormData({ roll_month: '', desc: '' });
            loadPayrolls();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to create payroll');
        }
    };

    const handleSubmit = (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        setIsSubmitModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!selectedPayroll) return;
        try {
            await submitPayroll(selectedPayroll.id);
            toast.success('Payroll submitted for audit');
            setIsSubmitModalOpen(false);
            setSelectedPayroll(null);
            loadPayrolls();
        } catch (err: any) {
            console.error('Submit error:', err);
            toast.error(err.message || err.response?.data?.msg || 'Failed to submit payroll');
        }
    };

    const handleAudit = async () => {
        if (!selectedPayroll) return;
        try {
            await auditPayroll({
                id: selectedPayroll.id,
                op: auditOp,
                desc: auditReason
            });
            toast.success(auditOp === 'approve' ? 'Payroll approved' : 'Payroll rejected');
            setIsAuditModalOpen(false);
            setSelectedPayroll(null);
            setAuditReason('');
            loadPayrolls();
        } catch (err: any) {
            console.error('Audit error:', err);
            toast.error(err.message || err.response?.data?.msg || 'Failed to audit payroll');
        }
    };

    const handleInitiatePay = async (payroll: Payroll) => {
        try {
            // Check permission by fetching config
            await fetchPayConfig(payroll.id);
            // If successful, open modal
            setSelectedPayroll(payroll);
            setIsConfirmPayModalOpen(true);
        } catch (err: any) {
            console.error('Permission check failed:', err);
            toast.error(err.response?.data?.msg || 'You do not have permission to pay or failed to fetch config');
        }
    };


    const { isConnected, chainId, address } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { writeContractAsync } = useWriteContract();
    const wagmiConfig = useConfig();

    const PAYROLL_ABI = [
        {
            "inputs": [],
            "name": "ReentrancyGuardReentrantCall",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "SafeERC20FailedOperation",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "transMonth",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "count",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "totalAmount",
                    "type": "uint256"
                }
            ],
            "name": "BatchTransferFrom",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "MAX_BATCH_SIZE",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "transMonth",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "recipients",
                    "type": "address[]"
                },
                {
                    "internalType": "uint256[]",
                    "name": "amounts",
                    "type": "uint256[]"
                }
            ],
            "name": "batchTransferFrom",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ] as const;

    const handlePay = async () => {
        if (!selectedPayroll) return;

        if (!isConnected || !address) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            // 1. Get payment config and payslips
            const { payroll_settings: config, payslips } = await fetchPayConfig(selectedPayroll.id);

            // 2. Check chain and switch if needed
            const chainMap: Record<string, number> = {
                'ethereum': 1,
                'mainnet': 1,
                'polygon': 137,
                'optimism': 10,
                'arbitrum': 42161,
                'base': 8453,
                'sepolia': 11155111,
                'bsc_testnet': 97
            };

            // Try to parse as number first, if fails, look up in map
            let targetChainId = parseInt(config.chain);
            if (isNaN(targetChainId)) {
                targetChainId = chainMap[config.chain.toLowerCase()];
            }

            if (!targetChainId) {
                toast.error(`Unsupported chain: ${config.chain}`);
                return;
            }

            if (chainId !== targetChainId) {
                try {
                    await switchChainAsync({ chainId: targetChainId });
                } catch (switchErr) {
                    console.error('Failed to switch chain:', switchErr);
                    toast.error('Failed to switch network. Please switch manually.');
                    return;
                }
            }

            const payTokenAddress = config.pay_token as `0x${string}`;
            const payContractAddress = config.pay_contract as `0x${string}`;

            // Fetch decimals
            const decimals = await readContract(wagmiConfig, {
                address: payTokenAddress,
                abi: erc20Abi,
                functionName: 'decimals',
            }) as number;

            const amount = parseUnits(selectedPayroll.total_amount, decimals);

            // 3. Check Allowance
            const allowance = await readContract(wagmiConfig, {
                address: payTokenAddress,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [address, payContractAddress],
            });

            if (allowance < amount) {
                toast.info(`Please approve ${selectedPayroll.total_amount} tokens...`);
                const approveHash = await writeContractAsync({
                    address: payTokenAddress,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [payContractAddress, amount],
                });

                toast.info('Waiting for approval confirmation...');
                await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
                toast.success('Approval confirmed!');
            }

            // 4. Call contract
            // Prepare batch arguments
            const safePayslips = payslips || [];
            if (safePayslips.length === 0) {
                toast.error('No payslips found for this payroll');
                return;
            }
            const recipients = safePayslips.map(p => p.wallet_address as `0x${string}`);
            const amounts = safePayslips.map(p => parseUnits(p.amount, decimals));
            const transMonth = BigInt(selectedPayroll.roll_month.replace(/-/g, ''));

            toast.info('Please confirm payment transaction...');
            const txHash = await writeContractAsync({
                address: payContractAddress,
                abi: PAYROLL_ABI,
                functionName: 'batchTransferFrom',
                args: [
                    payTokenAddress,
                    transMonth,
                    recipients,
                    amounts
                ],
            });

            toast.info('Transaction submitted. Waiting for confirmation...');
            await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

            // 5. Notify backend
            await payPayroll(selectedPayroll.id, txHash);

            toast.success('Payment completed successfully');
            setIsConfirmPayModalOpen(false);
            setSelectedPayroll(null);
            loadPayrolls();
        } catch (err: any) {
            console.error('Payment error:', err);
            toast.error(err.message || err.response?.data?.msg || 'Failed to process payment');
        }
    };

    const handleOpenDetail = (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        setIsDrawerOpen(true);
    };

    const handleDrawerUpdate = () => {
        loadPayrolls();
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Create Payroll
                    </button>
                </div>
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
                                        {/* All statuses: Show Details button */}
                                        <button
                                            onClick={() => handleOpenDetail(payroll)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Details
                                        </button>

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
                                                onClick={() => handleInitiatePay(payroll)}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                            >
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                Pay
                                            </button>
                                        )}

                                        {/* Paying: Show Check Status button */}
                                        {(payroll.status === 'paying' || payroll.flag === 5) && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await checkPayrollStatus(payroll.id);
                                                        toast.success('Status check initiated. Please refresh shortly.');
                                                    } catch (err: any) {
                                                        toast.error(err.response?.data?.msg || 'Failed to check status');
                                                    }
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                            >
                                                <Loader2 className="h-4 w-4 mr-1" />
                                                Check Status
                                            </button>
                                        )}

                                        {/* Rejected or Paid: No action button */}
                                        {(payroll.status === 'rejected' || payroll.status === 'paid' || payroll.flag === 3 || payroll.flag === 4) && (
                                            <span className="text-gray-400 text-xs italic">
                                                {payroll.status === 'paid' || payroll.flag === 4 ? 'Completed' : 'No actions available'}
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

            {/* Submit Confirmation Modal */}
            {isSubmitModalOpen && selectedPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Send className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Submit Payroll</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Submit for approval</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600">
                                Are you sure you want to submit the payroll for <strong>{selectedPayroll.roll_month}</strong>?
                                <br />
                                Once submitted, it will be locked for editing until approved or rejected.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => {
                                    setIsSubmitModalOpen(false);
                                    setSelectedPayroll(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                Confirm Submit
                            </button>
                        </div>
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
                                    onClick={() => setAuditOp('approve')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${auditOp === 'approve'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => setAuditOp('reject')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${auditOp === 'reject'
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
                                    {auditOp === 'reject' ? 'Reason for Rejection' : 'Comments (Optional)'}
                                </label>
                                <textarea
                                    value={auditReason}
                                    onChange={(e) => setAuditReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    rows={3}
                                    placeholder={auditOp === 'reject' ? 'Please provide a reason...' : 'Optional comments...'}
                                    required={auditOp === 'reject'}
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
                                    className={`px-4 py-2 text-white rounded-lg ${auditOp === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {auditOp === 'approve' ? 'Approve' : 'Reject'}
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
                            {!isConnected ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-600 mb-4">Please connect your wallet to proceed with payment.</p>
                                    <div className="flex justify-center">
                                        <ConnectButton />
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
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
                            {isConnected && (
                                <button
                                    onClick={handlePay}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Confirm Payment
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <PayrollDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                payroll={selectedPayroll}
                onUpdate={handleDrawerUpdate}
            />
        </div>
    );
};

export default PayrollPage;
