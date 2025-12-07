import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Menu,
    X,
    LogOut,
    ChevronRight,
    Bell,
    Search,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserMenus, groupMenuItems, type MenuGroup } from '../api/menuApi';
import { getIcon } from '../utils/iconMap';

export const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
    const [loadingMenus, setLoadingMenus] = useState(true);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Load dynamic menus
    useEffect(() => {
        const loadMenus = async () => {
            try {
                setLoadingMenus(true);
                const menus = await fetchUserMenus();
                const grouped = groupMenuItems(menus);
                setMenuGroups(grouped);
            } catch (error) {
                console.error('Failed to load menus:', error);
                // Fallback to empty menus
                setMenuGroups([]);
            } finally {
                setLoadingMenus(false);
            }
        };
        loadMenus();
    }, []);

    // Flatten all menu items for page title lookup
    const allMenuItems = menuGroups.flatMap(group => group.items);
    const currentPage = allMenuItems.find(item => item.func_path === location.pathname);
    const pageTitle = currentPage?.func_name || 'Dashboard';

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-20 px-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Manage</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 flex flex-col overflow-y-auto py-6 px-4">
                    {loadingMenus ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        </div>
                    ) : (
                        <nav className="space-y-6">
                            {menuGroups.map((group) => (
                                <div key={group.name}>
                                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        {group.name}
                                    </h3>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const IconComponent = getIcon(item.func_icon);
                                            return (
                                                <NavLink
                                                    key={item.func_id}
                                                    to={item.func_path}
                                                    onClick={() => setIsSidebarOpen(false)}
                                                    className={({ isActive }) => clsx(
                                                        isActive
                                                            ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out'
                                                    )}
                                                >
                                                    <IconComponent
                                                        className={clsx(
                                                            'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                                                            'text-gray-400 group-hover:text-gray-500',
                                                            (item.func_path === location.pathname) && 'text-primary-600'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.func_name}
                                                    {item.func_path === location.pathname && (
                                                        <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />
                                                    )}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    )}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <img
                            className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm"
                            src={user?.avatar || 'https://ui-avatars.com/api/?name=User'}
                            alt=""
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
                    <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <span className="sr-only">Open sidebar</span>
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
                                {pageTitle}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center px-4 py-2 bg-gray-100 rounded-lg focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                <Search className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="ml-2 bg-transparent border-none focus:outline-none text-sm w-48"
                                />
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
