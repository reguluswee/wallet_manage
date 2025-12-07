import api, { type ApiResponse } from './client';

// ============ Settings Management ============

export interface ChainOption {
    id: string;
    name: string;
    chain_id: number;
}

export interface TokenOption {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}

export interface PayrollSettings {
    chain: string;
    chain_id: number;
    payment_token: string;
    token_address: string;
    token_decimals: number;
}

export interface PayrollSettingsResponse {
    settings: PayrollSettings;
    available_chains: ChainOption[];
    available_tokens: Record<string, TokenOption[]>; // keyed by chain
}

// Fetch payroll settings
export const fetchPayrollSettings = async (): Promise<PayrollSettingsResponse> => {
    const response = await api.get<ApiResponse<PayrollSettingsResponse>>('/portal/sys/payroll/settings');
    return response.data.data!;
};

// Update payroll settings
export const updatePayrollSettings = async (data: Partial<PayrollSettings>): Promise<void> => {
    await api.post<ApiResponse>('/portal/sys/payroll/settings/update', data);
};
