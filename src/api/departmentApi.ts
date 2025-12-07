import api, { type ApiResponse } from './client';

// TypeScript interfaces for Department
export interface Department {
    id: number;
    name: string;
    desc: string;
    add_time: string;
    flag: number;
    status: string;
}

export interface DepartmentListResponse {
    portal_depts: Department[];
}

export interface CreateDepartmentRequest {
    name: string;
    desc: string;
}

export interface UpdateDepartmentRequest {
    id: number;
    name: string;
    desc: string;
}

export interface DeleteDepartmentRequest {
    id: number;
}

// API functions

/**
 * Fetch all departments
 */
export const fetchDepartments = async (): Promise<Department[]> => {
    const response = await api.get<ApiResponse<DepartmentListResponse>>('/portal/dept/list');
    return response.data.data.portal_depts || [];
};

/**
 * Create a new department
 */
export const createDepartment = async (data: CreateDepartmentRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/dept/create', data);
};

/**
 * Update an existing department
 */
export const updateDepartment = async (data: UpdateDepartmentRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/dept/update', data);
};

/**
 * Delete a department (soft delete)
 */
export const deleteDepartment = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/dept/delete', { id });
};
