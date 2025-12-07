import api, { type ApiResponse } from './client';

// ============ Function/Permission Management ============

// Backend function structure (matches actual API response)
interface BackendFunc {
    id: number;
    name: string;
    flag: number;
    res_uri: string;
    perm_code: string;
    type: string;  // "menu", "button", "other"
    group: string;
}

// Frontend function structure (for display)
export interface Func {
    id: number;
    func_name: string;
    func_desc: string;
    func_group: string;
    func_type: string;
}

export interface FuncListResponse {
    portal_funcs: BackendFunc[];
}

export interface RoleFuncListResponse {
    portal_funcs: BackendFunc[];  // Backend returns portal_funcs, not role_funcs
}

export interface RoleUserListResponse {
    portal_users: any[];  // Backend returns portal_users
}

// Fetch all available functions
export const fetchFunctions = async (): Promise<Func[]> => {
    const response = await api.get<ApiResponse<FuncListResponse>>('/portal/rbac/func/list');
    const backendFuncs = response.data.data?.portal_funcs || [];

    // Transform to frontend structure
    return backendFuncs.map(func => ({
        id: func.id,
        func_name: func.name,
        func_desc: func.perm_code,  // Use perm_code as description
        func_group: func.group,
        func_type: func.type
    }));
};

// Fetch functions assigned to a specific role
export const fetchRoleFunctions = async (roleId: number): Promise<Func[]> => {
    const response = await api.get<ApiResponse<RoleFuncListResponse>>(`/portal/rbac/role/func/list/${roleId}`);
    const backendFuncs = response.data.data?.portal_funcs || [];

    // Transform to frontend structure
    return backendFuncs.map(func => ({
        id: func.id,
        func_name: func.name,
        func_desc: func.perm_code,
        func_group: func.group,
        func_type: func.type
    }));
};

// Fetch users assigned to a specific role
export const fetchRoleUsers = async (roleId: number): Promise<any[]> => {
    const response = await api.get<ApiResponse<RoleUserListResponse>>(`/portal/rbac/role/user/list/${roleId}`);
    return response.data.data?.portal_users || [];
};

// Bind function to role
export const bindFunctionToRole = async (roleId: number, funcId: number): Promise<void> => {
    await api.post<ApiResponse>(`/portal/rbac/role/permission/func/bind/${roleId}/${funcId}`);
};

// Unbind function from role
export const unbindFunctionFromRole = async (roleId: number, funcId: number): Promise<void> => {
    await api.post<ApiResponse>(`/portal/rbac/role/permission/func/unbind/${roleId}/${funcId}`);
};

// Bind user to role
export const bindUserToRole = async (roleId: number, userId: number): Promise<void> => {
    await api.post<ApiResponse>(`/portal/rbac/role/permission/user/bind/${roleId}/${userId}`);
};

// Unbind user from role
export const unbindUserFromRole = async (roleId: number, userId: number): Promise<void> => {
    await api.post<ApiResponse>(`/portal/rbac/role/permission/user/unbind/${roleId}/${userId}`);
};
