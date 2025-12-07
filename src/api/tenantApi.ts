import api, { type ApiResponse } from './client';

export interface Tenant {
    id: number;
    unique_id: string;
    name: string;
    desc: string;
    add_time: string;
    version: string;
    call_back: string;
    flag: number;
}

export interface TenantListResponse {
    tenants: Tenant[];
}

export interface TenantResponse {
    tenant: Tenant;
}

export interface CreateTenantRequest {
    unique_id: string;
    name: string;
    desc?: string;
    callback?: string;
}

export interface UpdateTenantRequest {
    id: number;
    unique_id: string;
    name: string;
    desc?: string;
    callback?: string;
}

export interface DeleteTenantRequest {
    id: number;
}

export interface TenantDetailResponse {
    tenant: Tenant;
    api: {
        app_id: string;
        app_key: string;
    };
}

// Fetch all tenants
export const fetchTenants = async (): Promise<Tenant[]> => {
    const response = await api.get<ApiResponse<TenantListResponse>>('/portal/tenant/list');
    return response.data.data?.tenants || [];
};

// Create new tenant
export const createTenant = async (data: CreateTenantRequest): Promise<void> => {
    await api.post<ApiResponse<TenantResponse>>('/portal/tenant/create', data);
};

// Update existing tenant
export const updateTenant = async (data: UpdateTenantRequest): Promise<void> => {
    await api.post<ApiResponse<TenantResponse>>('/portal/tenant/update', data);
};

// Delete tenant
export const deleteTenant = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/tenant/delete', { id });
};

// Get tenant detail
export const getTenantDetail = async (id: number): Promise<TenantDetailResponse> => {
    const response = await api.get<ApiResponse<TenantDetailResponse>>(`/portal/tenant/detail/${id}`);
    return response.data.data!;
};
