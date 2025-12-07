import api, { type ApiResponse } from './client';

// Backend role structure (matches actual API response)
interface BackendRole {
    id: number;
    name: string;
    desc: string;
    add_time: string;
    flag: number;
}

// Frontend role structure (for display)
export interface Role {
    id: number;
    role_name: string;
    role_desc: string;
    add_time: string;
}

export interface RoleListResponse {
    portal_roles: BackendRole[];
}

export interface CreateRoleRequest {
    name: string;
    desc?: string;
}

export interface UpdateRoleRequest {
    id: number;
    name: string;
    desc?: string;
}

// Fetch all roles
export const fetchRoles = async (): Promise<Role[]> => {
    const response = await api.get<ApiResponse<RoleListResponse>>('/portal/rbac/role/list');
    const backendRoles = response.data.data?.portal_roles || [];

    // Transform backend structure to frontend structure
    return backendRoles.map(role => ({
        id: role.id,
        role_name: role.name,
        role_desc: role.desc || '',
        add_time: role.add_time || ''
    }));
};

// Create new role
export const createRole = async (data: CreateRoleRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/rbac/role/create', data);
};

// Update existing role
export const updateRole = async (data: UpdateRoleRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/rbac/role/update', data);
};

// Delete role
export const deleteRole = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/rbac/role/delete', { id });
};
