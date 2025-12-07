import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Mail,
    Phone,
    MoreVertical,
    Plus,
    Search,
    Filter,
    MapPin,
    Loader2,
    AlertCircle,
    X,
    Check
} from 'lucide-react';
import { fetchUsers, updateUser, type User } from '../api/userApi';
import { fetchDepartments, type Department } from '../api/departmentApi';

const UserModal = ({ isOpen, onClose, user, allDepartments, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    allDepartments: Department[];
    onSubmit: (data: any) => Promise<void>;
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setLocation(user.location || '');
            setSelectedDeptIds(user.departments?.map(d => d.id) || []);
        } else {
            setName('');
            setEmail('');
            setLocation('');
            setSelectedDeptIds([]);
        }
        setError(null);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await onSubmit({
                id: user.id,
                name,
                email,
                location,
                dept_ids: selectedDeptIds
            });
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDept = (deptId: number) => {
        setSelectedDeptIds(prev =>
            prev.includes(deptId)
                ? prev.filter(id => id !== deptId)
                : [...prev, deptId]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
                            <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1">
                                {allDepartments.map(dept => (
                                    <div
                                        key={dept.id}
                                        onClick={() => toggleDept(dept.id)}
                                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedDeptIds.includes(dept.id)
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${selectedDeptIds.includes(dept.id)
                                                ? 'bg-primary-500 border-primary-500 text-white'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedDeptIds.includes(dept.id) && <Check className="h-3 w-3" />}
                                        </div>
                                        <span className="text-sm font-medium">{dept.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const PersonCard = ({ name, departments, email, location, onViewProfile, delay }: any) => {
    const deptString = departments?.map((d: any) => d.name).join(', ') || 'No Department';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <img
                        src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                        alt={name}
                        className="h-12 w-12 rounded-full ring-2 ring-white shadow-sm"
                    />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                        <p className="text-sm text-primary-600 font-medium">Employee</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {deptString}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {location || 'Unknown Location'}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex gap-2">
                <button
                    onClick={onViewProfile}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    View Profile
                </button>
                <button className="p-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )
};

export const Personnel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, deptsData] = await Promise.all([
                fetchUsers(),
                fetchDepartments()
            ]);
            setUsers(usersData);
            setDepartments(deptsData);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateUser = async (data: any) => {
        await updateUser(data);
        await loadData(); // Refresh list
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personnel</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your team members and roles.</p>
                </div>
                <button className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 text-sm font-medium">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Employee
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                </button>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No users found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user, index) => (
                        <PersonCard
                            key={user.id}
                            {...user}
                            delay={index * 0.1}
                            onViewProfile={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                allDepartments={departments}
                onSubmit={handleUpdateUser}
            />
        </div>
    );
};
