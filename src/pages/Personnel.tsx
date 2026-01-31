import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Mail,
    MoreVertical,
    Plus,
    Search,
    Filter,
    MapPin,
    Loader2,
    AlertCircle,
    Trash,
    Key,
    X,
    Check,
    Eye,
    EyeOff
} from 'lucide-react';
import { fetchUsers, updateUser, createUser, resetPassword, deleteUser, type User } from '../api/userApi';
import { fetchDepartments, type Department } from '../api/departmentApi';
import SHA256 from 'crypto-js/sha256';

const UserModal = ({ isOpen, onClose, user, allDepartments, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    allDepartments: Department[];
    onSubmit: (data: any) => Promise<void>;
}) => {
    const [name, setName] = useState('');
    const [loginId, setLoginId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState('');
    const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setLoginId(user.login_id || '');
            setEmail(user.email);
            // Password is not populated for security and update flow ignores it
            setPassword('');
            setLocation(user.location || '');
            setSelectedDeptIds(user.departments?.map(d => d.id) || []);
        } else {
            setName('');
            setLoginId('');
            setEmail('');
            setPassword('');
            setLocation('');
            setSelectedDeptIds([]);
        }
        setError(null);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            if (user) {
                // Update existing user
                await onSubmit({
                    id: user.id,
                    name,
                    login_id: loginId,
                    email,
                    location,
                    dept_ids: selectedDeptIds
                });
            } else {
                // Create new user
                await onSubmit({
                    name,
                    login_id: loginId,
                    email,
                    location,
                    dept_ids: selectedDeptIds,
                    password: SHA256(password).toString()
                });
            }
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save user');
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
                            <input
                                type="text"
                                value={loginId}
                                onChange={e => setLoginId(e.target.value)}
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

                        {!user && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-10"
                                        required={!user}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

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

const ResetPasswordModal = ({ isOpen, onClose, user, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSubmit: (password: string) => Promise<void>;
}) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setShowPassword(false);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Check empty password
        if (!password) {
            setError('Password is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await onSubmit(password);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
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
                            <p className="text-sm text-gray-500 mb-4">
                                Enter a new password for <span className="font-bold text-gray-900">{user.name}</span>.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
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
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, user, onConfirm }: {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onConfirm: () => Promise<void>;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            setError(null);
            await onConfirm();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to delete user');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <p className="text-gray-600">
                            Are you sure you want to delete <span className="font-bold text-gray-900">{user.name}</span>? This action cannot be undone.
                        </p>

                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const PersonCard = ({ name, departments, email, location, onViewProfile, onResetPassword, onDelete, delay }: any) => {
    const deptString = departments?.map((d: any) => d.name).join(', ') || 'No Department';
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 group relative"
            onMouseLeave={() => setShowMenu(false)}
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
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </button>
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10"
                            >
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onResetPassword();
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                    <Key className="h-4 w-4 mr-2 text-gray-400" />
                                    Reset Password
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDelete();
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center transition-colors"
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete User
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

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

    const handleSaveUser = async (data: any) => {
        if (data.id) {
            // Update existing user
            await updateUser(data);
        } else {
            // Create new user
            await createUser(data);
        }
        await loadData(); // Refresh list
    };

    const handleResetPassword = async (password: string) => {
        if (userToReset) {
            await resetPassword({
                id: userToReset.id,
                password: SHA256(password).toString()
            });
            setIsResetPasswordModalOpen(false);
            setUserToReset(null);
        }
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            await loadData();
        }
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
                <button
                    onClick={() => {
                        setSelectedUser(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 text-sm font-medium"
                >
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
                            onResetPassword={() => {
                                setUserToReset(user);
                                setIsResetPasswordModalOpen(true);
                            }}
                            onDelete={() => {
                                setUserToDelete(user);
                                setIsDeleteModalOpen(true);
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
                onSubmit={handleSaveUser}
            />

            <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => {
                    setIsResetPasswordModalOpen(false);
                    setUserToReset(null);
                }}
                user={userToReset}
                onSubmit={handleResetPassword}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                user={userToDelete}
                onConfirm={handleDeleteUser}
            />
        </div>
    );
};
