import api, { type ApiResponse } from './client';

// Backend response structure (matches actual API response)
interface BackendFunc {
    id: number;
    name: string;
    flag: number;
    res_uri: string;  // Note: it's res_uri, not res_url
    perm_code: string;
    type: string;  // "menu" in lowercase
    group: string;
}

// Frontend menu item structure
export interface MenuItem {
    func_id: number;
    func_name: string;
    func_desc: string;
    func_path: string;
    func_icon: string;
    func_group: string;
    func_order: number;
}

export interface MenuGroup {
    name: string;
    items: MenuItem[];
}

export interface UserMenusResponse {
    portal_funcs: BackendFunc[];
}

// Map icon based on perm_code
const getIconName = (permCode: string): string => {
    if (permCode.includes('dept')) return 'Building2';
    if (permCode.includes('user')) return 'Users';
    if (permCode.includes('role')) return 'Shield';
    if (permCode.includes('payroll')) return 'Banknote';
    if (permCode.includes('payslip')) return 'FileText';
    if (permCode.includes('tenant')) return 'Server';
    if (permCode.includes('setting')) return 'Settings';
    return 'LayoutDashboard';
};

// Map res_uri to route path
const getRoutePath = (resUri: string): string => {
    // Remove /admin/portal prefix and map to frontend routes
    const pathMap: Record<string, string> = {
        '/admin/portal/dept/list': '/departments',
        '/admin/portal/user/list': '/personnel',
        '/admin/portal/rbac/role/list': '/roles',
        '/admin/portal/payroll/list': '/payroll',
        '/admin/portal/payroll/staff/list': '/payroll-staff',  // Payroll Staff wallet management
        '/admin/portal/payslip/list': '/payslips',
        '/admin/portal/tenant/list': '/tenants',
        '/admin/portal/sys/payroll/settings': '/settings'
    };
    return pathMap[resUri] || '/';
};

// Fetch user menus based on permissions
export const fetchUserMenus = async (): Promise<MenuItem[]> => {
    const response = await api.get<ApiResponse<UserMenusResponse>>('/portal/rbac/user/menus');
    const backendFuncs = response.data.data?.portal_funcs || [];

    console.log('Backend menu response:', backendFuncs); // For debugging

    // Filter only menu type items and transform to frontend structure
    return backendFuncs
        .filter(func => func.type.toLowerCase() === 'menu')
        .map((func, index) => ({
            func_id: func.id,
            func_name: func.name,
            func_desc: func.perm_code,
            func_path: getRoutePath(func.res_uri),
            func_icon: getIconName(func.perm_code),
            func_group: func.group, // Use the group field directly
            func_order: index
        }));
};

// Group menu items by category
export const groupMenuItems = (items: MenuItem[]): MenuGroup[] => {
    const groups: Record<string, MenuItem[]> = {};

    items.forEach(item => {
        const groupKey = item.func_group || 'Other'; // Use func_group from MenuItem
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
    });

    // Sort items within each group by func_order
    for (const groupKey in groups) {
        groups[groupKey].sort((a, b) => a.func_order - b.func_order);
    }

    // Convert to MenuGroup array and sort groups
    const groupOrder = ['overview', 'permission', 'salary', 'system', 'tenant', 'other']; // Use lowercase group keys for sorting
    return Object.entries(groups)
        .map(([groupKey, items]) => ({
            name: groupKey.charAt(0).toUpperCase() + groupKey.slice(1), // Capitalize first letter for display
            items
        }))
        .sort((a, b) => {
            const aIndex = groupOrder.indexOf(a.name.toLowerCase());
            const bIndex = groupOrder.indexOf(b.name.toLowerCase());
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
};
