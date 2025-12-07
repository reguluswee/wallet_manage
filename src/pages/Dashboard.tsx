import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Building2,
    Banknote,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../api/client';

const StatCard = ({ title, value, change, changeType, icon: Icon, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                <Icon className="h-6 w-6" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
            </button>
        </div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className={clsx(
                "flex items-center text-sm font-medium px-2 py-1 rounded-lg",
                changeType === 'increase' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
            )}>
                {changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {change}
            </div>
        </div>
    </motion.div>
);

export const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Call dashboard API when component mounts
    useEffect(() => {
        // Create an AbortController to cancel the request if component unmounts
        const abortController = new AbortController();

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/portal/dashboard', {
                    signal: abortController.signal
                });
                console.log('Dashboard API response:', response.data);
                // You can process the response data here if needed
            } catch (err: any) {
                // Ignore abort errors (when component unmounts)
                if (err.name === 'CanceledError' || err.name === 'AbortError') {
                    console.log('Request was cancelled');
                    return;
                }
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Cleanup function: abort the request if component unmounts
        return () => {
            abortController.abort();
        };
    }, []);

    const stats = [
        {
            title: 'Total Employees',
            value: '128',
            change: '+12%',
            changeType: 'increase',
            icon: Users,
        },
        {
            title: 'Active Departments',
            value: '12',
            change: '0%',
            changeType: 'increase',
            icon: Building2,
        },
        {
            title: 'Pending Payroll',
            value: '$142,000',
            change: '+5.4%',
            changeType: 'increase',
            icon: Banknote,
        },
        {
            title: 'Avg. Performance',
            value: '94%',
            change: '-2.1%',
            changeType: 'decrease',
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Dashboard Content */}
            {!loading && (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                            <p className="mt-1 text-sm text-gray-500">Here's what's happening with your company today.</p>
                        </div>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 text-sm font-medium">
                            Download Report
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <StatCard key={stat.title} {...stat} delay={index * 0.1} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Activity Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">New employee onboarded</p>
                                            <p className="text-xs text-gray-500">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Actions Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 shadow-lg text-white"
                        >
                            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors text-left">
                                    <Users className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Add Employee</span>
                                </button>
                                <button className="p-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors text-left">
                                    <Banknote className="h-6 w-6 mb-2" />
                                    <span className="text-sm font-medium">Process Payroll</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};
