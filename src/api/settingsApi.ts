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

// Backend response structure
interface BackendSettingsResponse {
    config_map: Record<string, Record<string, string>>; // chain -> token -> address
    payroll_settings: {
        chain: string;
        pay_contract: string;
        pay_token: string;
    };
}

// Fetch payroll settings
export const fetchPayrollSettings = async (): Promise<PayrollSettingsResponse> => {
    const response = await api.get<ApiResponse<BackendSettingsResponse>>('/portal/sys/payroll/settings');
    const backendData = response.data.data!;

    // Transform config_map to available_chains and available_tokens
    const chains: ChainOption[] = [];
    const tokens: Record<string, TokenOption[]> = {};

    // Chain configurations (hardcoded for now, could be from another API)
    const chainConfigs: Record<string, { name: string, chain_id: number }> = {
        'arbitrum': { name: 'Arbitrum', chain_id: 42161 },
        'ethereum': { name: 'Ethereum', chain_id: 1 },
        'polygon': { name: 'Polygon', chain_id: 137 }
    };

    // Process config_map
    Object.entries(backendData.config_map || {}).forEach(([chainId, tokenMap]) => {
        // Add chain option
        const chainConfig = chainConfigs[chainId] || { name: chainId, chain_id: 0 };
        chains.push({
            id: chainId,
            name: chainConfig.name,
            chain_id: chainConfig.chain_id
        });

        // Add token options for this chain
        tokens[chainId] = Object.entries(tokenMap).map(([symbol, address]) => ({
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(),
            address: address,
            decimals: symbol.toLowerCase() === 'usdc' || symbol.toLowerCase() === 'usdt' ? 6 : 18
        }));
    });

    // Transform payroll_settings to frontend format
    const settings: PayrollSettings = {
        chain: backendData.payroll_settings?.chain || '',
        chain_id: chainConfigs[backendData.payroll_settings?.chain]?.chain_id || 0,
        payment_token: backendData.payroll_settings?.pay_token || '',
        token_address: backendData.payroll_settings?.pay_contract || '',
        token_decimals: 6 // Default, will be updated based on token
    };

    return {
        settings,
        available_chains: chains,
        available_tokens: tokens
    };
};

// Update payroll settings
export const updatePayrollSettings = async (data: Partial<PayrollSettings>): Promise<void> => {
    // Transform frontend field names to backend expected names
    const requestData = {
        chain: data.chain || '',
        pay_contract: data.token_address || '',
        pay_token: data.payment_token || ''
    };

    await api.post<ApiResponse>('/portal/sys/payroll/settings/save', requestData);
};
