import { useState, useEffect } from 'react';
import { X, Save, Users, DollarSign, Wallet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import {
    type Payroll,
    type PayrollItem,
    updatePayroll,
    fetchPayrollDetail
} from '../api/payrollApi';
import { fetchPayrollStaff, type PayrollStaffMember } from '../api/payrollStaffApi';

interface PayrollDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    payroll: Payroll | null;
    onUpdate: () => void;
}

const PayrollDetailDrawer = ({ isOpen, onClose, payroll, onUpdate }: PayrollDetailDrawerProps) => {
    const [items, setItems] = useState<PayrollItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [staffList, setStaffList] = useState<PayrollStaffMember[]>([]);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && payroll) {
            loadData();
        }
    }, [isOpen, payroll]);

    const loadData = async () => {
        if (!payroll) return;
        try {
            setLoading(true);
            // Load payroll detail to get existing items
            // Note: Backend might not return items in detail yet, but we'll assume it does or we start empty
            // For now, we'll just load staff list to be ready for import
            const staffData = await fetchPayrollStaff();
            setStaffList(staffData);

            // TODO: If backend supports returning items in detail, load them here
            // const detail = await fetchPayrollDetail(payroll.id);
            // setItems(detail.items || []); 

            // For now, if it's a new draft, it might be empty. 
            // If we want to persist, we need to fetch detail. 
            // Let's try to fetch detail.
            try {
                const detail = await fetchPayrollDetail(payroll.id);
                // Map backend response to PayrollItem if needed
                // Assuming detail.staff_list is what we want
                if (detail.staff_list && detail.staff_list.length > 0) {
                    setItems(detail.staff_list.map(s => ({
                        user_id: s.user_id,
                        wallet_address: s.wallet_address,
                        wallet_type: 'ERC20', // Default or from backend
                        wallet_chain: 'Arbitrum', // Default or from backend
                        amount: s.amount
                    })));
                } else {
                    setItems([]);
                }
            } catch (e) {
                console.log("No existing detail or failed to load detail", e);
                setItems([]);
            }

        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleImportStaff = () => {
        if (staffList.length === 0) {
            toast.warning('No staff members found to import');
            return;
        }

        const newItems: PayrollItem[] = staffList.map(staff => ({
            user_id: staff.id,
            wallet_address: staff.wallet_address || '',
            wallet_type: staff.wallet_type || 'ERC20',
            wallet_chain: staff.wallet_chain || 'Arbitrum',
            amount: '0'
        }));

        setItems(newItems);
        toast.success(`Imported ${newItems.length} staff members`);
    };

    const handleAmountChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index].amount = value;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!payroll) return;

        try {
            setSaving(true);

            // Calculate total amount
            const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

            await updatePayroll({
                id: payroll.id,
                roll_month: payroll.roll_month,
                desc: payroll.desc,
                status: 'create', // Keep as draft
                total_amount: totalAmount.toString(),
                items: items
            });

            toast.success('Payroll updated successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Failed to save payroll:', error);
            toast.error(error.response?.data?.msg || 'Failed to save payroll');
        } finally {
            setSaving(false);
        }
    };

    // Helper to get name from staff list
    const getStaffName = (userId: number) => {
        const staff = staffList.find(s => s.id === userId);
        return staff ? staff.name : `User ${userId}`;
    };

    const getStaffEmail = (userId: number) => {
        const staff = staffList.find(s => s.id === userId);
        return staff ? staff.email : '';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Payroll Details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {payroll?.roll_month} • {items.length} Employees
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                            <button
                                onClick={handleImportStaff}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Import All Staff
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Total: <span className="font-bold text-gray-900">
                                        {items.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                    <Users className="h-12 w-12 mb-3 opacity-50" />
                                    <p className="text-sm font-medium">No employees in this payroll</p>
                                    <button
                                        onClick={handleImportStaff}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Import from Staff List
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {getStaffName(item.user_id).charAt(0)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {getStaffName(item.user_id)}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {getStaffEmail(item.user_id)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Wallet className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {item.wallet_address ?
                                                            `${item.wallet_address.slice(0, 6)}...${item.wallet_address.slice(-4)}` :
                                                            'No wallet set'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-48">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Amount ({item.wallet_type || 'Token'})
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                                        className="block w-full pl-9 pr-3 py-2 text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PayrollDetailDrawer;
