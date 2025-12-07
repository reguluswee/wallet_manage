import api, { type ApiResponse } from './client';

export interface Payslip {
    id: number;
    payroll_id: number;
    user_id: number;
    wallet_id: number;
    wallet_address: string;
    wallet_type: string;
    wallet_chain: string;
    amount: string;
    flag: number;
    trans_time: string;
    receipt_hash: string;
    roll_month: string;
    status: string;
    pay_time: string;
}

// Fetch all payslips
export const fetchPayslips = async (): Promise<Payslip[]> => {
    const response = await api.get<ApiResponse<Payslip[]>>('/portal/payslip/list');
    return response.data.data || [];
};
