import api, { type ApiResponse } from './client';

export interface Payslip {
    id: number;
    user_id: number;
    user_name: string;
    payroll_id: number;
    amount: string;
    status: string;
    pay_time: string;
    add_time: string;
}

export interface PayslipListResponse {
    payslips: Payslip[];
}

// Fetch all payslips
export const fetchPayslips = async (): Promise<Payslip[]> => {
    const response = await api.get<ApiResponse<PayslipListResponse>>('/portal/payslip/list');
    return response.data.data?.payslips || [];
};
