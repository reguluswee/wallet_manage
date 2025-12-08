import api, { type ApiResponse } from './client';

// ============ Payroll Management ============

export interface Payroll {
    id: number;
    roll_month: string;  // Backend uses roll_month, not payroll_name
    flag: number;  // Backend uses flag for status: 0=draft, 1=submitted, 2=approved, 3=rejected, 4=paid
    status: string;  // Status description from backend
    creator_id: number;
    total_amount: string;
    currency: string;
    add_time: string;
    desc: string;
    pay_time: string;
}

export interface PayrollListResponse {
    payroll_list: Payroll[];  // Backend returns payroll_list, not payrolls
}

export interface PayslipDetailItem {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    amount: string;
    wallet_id: number;
    wallet_address: string;
    wallet_type: string;
    wallet_chain: string;
    status: string;
}

export interface PayrollDetailResponse {
    payroll: Payroll;
    items: PayslipDetailItem[];
}

export interface CreatePayrollRequest {
    roll_month: string;  // Format: YYYY-MM
    desc: string;
}

export interface PayrollItem {
    id?: number; // payslip_id
    user_id: number;
    wallet_id: number;
    wallet_address: string;
    wallet_type: string;
    wallet_chain: string;
    amount: string;
}

export interface UpdatePayrollRequest {
    id: number;
    roll_month: string;
    desc: string;
    status: string;
    total_amount: string;
    items: PayrollItem[];
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
    id: number;
    op: 'approve' | 'reject';
    desc?: string;
}

// Fetch all payrolls
export const fetchPayrolls = async (): Promise<Payroll[]> => {
    const response = await api.get<ApiResponse<PayrollListResponse>>('/portal/payroll/list');
    return response.data.data?.payroll_list || [];
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
    await api.post<ApiResponse>('/portal/payroll/submit', { id, flag: 1 });
};

// Audit payroll (approve/reject)
export const auditPayroll = async (data: AuditRequest): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/audit', data);
};

export interface PayrollSettings {
    chain: string;
    pay_contract: string;
    pay_token: string;
}

export interface PayConfigResponse {
    payroll_settings: PayrollSettings;
    payroll_summary: Payroll;
}

// ... existing code ...

// Get payroll payment configuration
export const fetchPayConfig = async (id: number): Promise<PayConfigResponse> => {
    const response = await api.post<ApiResponse<PayConfigResponse>>('/portal/payroll/pay/config', { id });
    return response.data.data;
};

// Pay payroll
export const payPayroll = async (id: number, txHash: string): Promise<void> => {
    await api.post<ApiResponse>('/portal/payroll/pay', { id, tx_hash: txHash });
};

// Delete payslip item
export const deletePayslip = async (payslipId: number): Promise<void> => {
    await api.post<ApiResponse>(`/portal/payroll/staff/delete/${payslipId}`);
};
