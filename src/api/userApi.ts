import api, { type ApiResponse } from './client';

export interface DepartmentItem {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    login_id: string;
    location: string;
    dept_list: string; // JSON string from backend
    departments?: DepartmentItem[]; // Parsed departments
}

export interface UserListResponse {
    users: User[];
}

export interface UpdateUserRequest {
    id: number;
    name: string;
    login_id: string;
    email: string;
    location: string;
    dept_ids: number[];
}

export interface CreateUserRequest {
    name: string;
    login_id: string;
    email: string;
    location: string;
    dept_ids: number[];
}

/**
 * Fetch all users
 */
export const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<UserListResponse>>('/portal/user/list');
    const users = response.data.data?.users || [];

    // Parse dept_list string into departments array
    return users.map(user => {
        let departments: DepartmentItem[] = [];
        try {
            if (user.dept_list) {
                departments = JSON.parse(user.dept_list);
            }
        } catch (e) {
            console.error('Failed to parse dept_list for user', user.id, e);
        }
        return { ...user, departments };
    });
};

/**
 * Create new user
 */
export const createUser = async (data: CreateUserRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/user/add', data);
};

/**
 * Update user profile
 */
export const updateUser = async (data: UpdateUserRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/user/update', data);
};
