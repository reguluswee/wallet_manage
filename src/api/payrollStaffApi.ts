import api, { type ApiResponse } from './client';

export interface PayrollStaffMember {
    id: number;
    name: string;
    email: string;
    wallet_address: string;
    login_id: string;
    location?: string;
    wallet_chain?: string;
    wallet_type?: string;
    add_time?: string;
    type?: string;
}

export interface PayrollStaffListResponse {
    staff_list: PayrollStaffMember[];
}

export interface UpdateWalletRequest {
    wallet_address: string;
}

// Fetch payroll staff list
export const fetchPayrollStaff = async (): Promise<PayrollStaffMember[]> => {
    const response = await api.get<ApiResponse<PayrollStaffListResponse>>('/portal/payroll/staff/list');
    return response.data.data?.staff_list || [];
};

// Update user wallet address
export const updateStaffWallet = async (userId: number, data: UpdateWalletRequest): Promise<void> => {
    await api.post<ApiResponse>(`/portal/payroll/staff/wallet/${userId}`, data);
};
