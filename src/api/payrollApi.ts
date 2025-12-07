import api, { type ApiResponse } from './client';

// ============ Payroll Management ============

export interface Payroll {
    id: number;
    payroll_name: string;
    payroll_desc: string;
    pay_time: string;
    status: string; // '00'=draft, '01'=submitted, '02'=approved, '03'=rejected, '04'=paid
    total_amount: string;
    add_time: string;
    update_time: string;
}

export interface PayrollListResponse {
    payrolls: Payroll[];
}

export interface PayrollStaff {
    id: number;
    user_id: number;
    user_name: string;
    amount: string;
    wallet_address: string;
    status: string;
}

export interface PayrollDetailResponse {
    payroll: Payroll;
    staff_list: PayrollStaff[];
}

export interface CreatePayrollRequest {
    payroll_name: string;
    payroll_desc: string;
    pay_time: string;
}

export interface UpdatePayrollRequest {
    id: number;
    payroll_name: string;
    payroll_desc: string;
    pay_time: string;
}

export interface StaffItem {
    user_id: number;
    amount: string;
}

export interface SetStaffRequest {
    payroll_id: number;
    staff_list: StaffItem[];
}

export interface SetWalletRequest {
    wallet_address: string;
}

export interface AuditRequest {
    payroll_id: number;
    status: string; // '02'=approved, '03'=rejected
    reason?: string;
}

// Fetch all payrolls
export const fetchPayrolls = async (): Promise<Payroll[]> => {
    const response = await api.get<ApiResponse<PayrollListResponse>>('/portal/payroll/list');
    return response.data.data?.payrolls || [];
};

// Fetch payroll detail
export const fetchPayrollDetail = async (id: number): Promise<PayrollDetailResponse> => {
    const response = await api.get<ApiResponse<PayrollDetailResponse>>(`/portal/payroll/detail/${id}`);
    return response.data.data!;
};

// Create payroll
export const createPayroll = async (data: CreatePayrollRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/create', data);
};

// Update payroll
export const updatePayroll = async (data: UpdatePayrollRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/update', data);
};

// Delete payroll
export const deletePayroll = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/delete', { id });
};

// Set payroll staff
export const setPayrollStaff = async (data: SetStaffRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/staff/set', data);
};

// Set user wallet address
export const setUserWallet = async (userId: number, data: SetWalletRequest): Promise<void> => {
    await api.post<ApiResponse>(`/portal/payroll/staff/wallet/${userId}`, data);
};

// Submit payroll for audit
export const submitPayroll = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/submit', { id });
};

// Audit payroll (approve/reject)
export const auditPayroll = async (data: AuditRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/audit', data);
};

// Pay payroll
export const payPayroll = async (id: number): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/pay', { id });
};
