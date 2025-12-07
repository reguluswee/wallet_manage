import React from 'react';
import { motion } from 'framer-motion';
import {
    Banknote,
    Calendar,
    CheckCircle,
    Clock,
    MoreVertical,
    Download,
    Filter,
    Search
} from 'lucide-react';

const PayrollCard = ({ employee, amount, date, status, type, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                    <Banknote className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{amount}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{type}</p>
                </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                <MoreVertical className="h-5 w-5" />
            </button>
        </div>

        <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Employee</span>
                <span className="font-medium text-gray-900">{employee}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{date}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {status === 'Paid' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                    {status}
                </span>
            </div>
        </div>

        <div className="pt-4 border-t border-gray-50">
            <button className="w-full flex items-center justify-center py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download Slip
            </button>
        </div>
    </motion.div>
);

export const Payroll: React.FC = () => {
    const payrolls = [
        { employee: 'Alex Johnson', amount: '$4,500.00', date: 'Oct 25, 2023', status: 'Paid', type: 'Salary' },
        { employee: 'Sarah Wilson', amount: '$3,800.00', date: 'Oct 25, 2023', status: 'Paid', type: 'Salary' },
        { employee: 'Mike Brown', amount: '$4,200.00', date: 'Oct 25, 2023', status: 'Pending', type: 'Salary' },
        { employee: 'Emily Davis', amount: '$1,200.00', date: 'Oct 28, 2023', status: 'Pending', type: 'Bonus' },
        { employee: 'Robert Taylor', amount: '$3,900.00', date: 'Oct 25, 2023', status: 'Paid', type: 'Salary' },
        { employee: 'Jessica Miller', amount: '$5,100.00', date: 'Oct 25, 2023', status: 'Paid', type: 'Commission' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payroll</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage salaries and payments.</p>
                </div>
                <button className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 text-sm font-medium">
                    <Banknote className="h-5 w-5 mr-2" />
                    Run Payroll
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search payroll records..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <Calendar className="h-5 w-5 mr-2" />
                    Oct 2023
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payrolls.map((payroll, index) => (
                    <PayrollCard key={index} {...payroll} delay={index * 0.1} />
                ))}
            </div>
        </div>
    );
};
