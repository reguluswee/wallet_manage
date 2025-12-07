import { useState, useEffect } from 'react';
import { Users, Wallet, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { fetchPayrollStaff, updateStaffWallet, type PayrollStaffMember } from '../api/payrollStaffApi';

const PayrollStaff = () => {
    const [staff, setStaff] = useState<PayrollStaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<PayrollStaffMember | null>(null);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await fetchPayrollStaff();
            setStaff(data);
        } catch (error) {
            console.error('Failed to load staff:', error);
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const handleSetWallet = (staffMember: PayrollStaffMember) => {
        setSelectedStaff(staffMember);
        setWalletAddress(staffMember.wallet_address || '');
        setIsWalletModalOpen(true);
    };

    const handleSaveWallet = async () => {
        if (!selectedStaff) return;

        try {
            setSaving(true);
            await updateStaffWallet(selectedStaff.id, { wallet_address: walletAddress });
            toast.success('Wallet address updated successfully');
            setIsWalletModalOpen(false);
            loadStaff();
        } catch (error: any) {
            console.error('Failed to update wallet:', error);
            toast.error(error.response?.data?.msg || 'Failed to update wallet address');
        } finally {
            setSaving(false);
        }
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payroll Staff</h1>
                <p className="text-gray-500 mt-1">Manage employee wallet addresses for payroll distribution</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Login ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Wallet Address
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <Users className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.login_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.location || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {member.wallet_address ? (
                                            <div>
                                                <div className="text-sm font-mono text-gray-900">
                                                    {member.wallet_address.slice(0, 6)}...{member.wallet_address.slice(-4)}
                                                </div>
                                                {member.wallet_chain && (
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {member.wallet_chain} • {member.wallet_type || 'ERC20'}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleSetWallet(member)}
                                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            <Wallet className="h-4 w-4 mr-1.5" />
                                            {member.wallet_address ? 'Edit' : 'Set'} Wallet
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {staff.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members</h3>
                        <p className="mt-1 text-sm text-gray-500">No employees found in the system.</p>
                    </div>
                )}
            </div>

            {/* Wallet Address Modal */}
            {isWalletModalOpen && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Set Wallet Address</h3>
                            <p className="text-sm text-gray-500 mt-1">for {selectedStaff.name}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Wallet Address
                                </label>
                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter the employee's blockchain wallet address for receiving payroll
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setIsWalletModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveWallet}
                                disabled={saving || !walletAddress}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Wallet'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollStaff;
