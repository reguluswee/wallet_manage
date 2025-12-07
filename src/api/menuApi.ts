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

// Map group name to display name
const getGroupName = (group: string): string => {
    const groupMap: Record<string, string> = {
        'system': 'System',
        'permission': 'HR Management',
        'salary': 'Payroll',
        'tenant': 'System',
        'overview': 'Overview'
    };
    return groupMap[group.toLowerCase()] || 'Other';
};

// Map res_uri to route path
const getRoutePath = (resUri: string): string => {
    // Remove /admin/portal prefix and map to frontend routes
    const pathMap: Record<string, string> = {
        '/admin/portal/dept/list': '/departments',
        '/admin/portal/user/list': '/personnel',
        '/admin/portal/rbac/role/list': '/roles',
        '/admin/portal/payroll/list': '/payroll',
        '/admin/portal/payroll/staff/list': '/payroll',  // Same as payroll for now
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
            func_group: getGroupName(func.group),
            func_order: index
        }));
};

// Group menus by func_group
export const groupMenus = (menus: MenuItem[]): MenuGroup[] => {
    const groups = new Map<string, MenuItem[]>();

    menus.forEach(menu => {
        const group = menu.func_group || 'Other';
        if (!groups.has(group)) {
            groups.set(group, []);
        }
        groups.get(group)!.push(menu);
    });

    // Sort items within each group by func_order
    groups.forEach((items) => {
        items.sort((a, b) => a.func_order - b.func_order);
    });

    // Convert to array and sort groups
    const groupOrder = ['Overview', 'HR Management', 'Payroll', 'System', 'Other'];
    return Array.from(groups.entries())
        .map(([name, items]) => ({ name, items }))
        .sort((a, b) => {
            const aIndex = groupOrder.indexOf(a.name);
            const bIndex = groupOrder.indexOf(b.name);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
};
