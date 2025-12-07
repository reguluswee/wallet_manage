import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2, Save } from 'lucide-react';
import { fetchPayrollSettings, updatePayrollSettings, type PayrollSettings, type PayrollSettingsResponse, type ChainOption, type TokenOption } from '../api/settingsApi';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<PayrollSettings | null>(null);
    const [availableChains, setAvailableChains] = useState<ChainOption[]>([]);
    const [availableTokens, setAvailableTokens] = useState<Record<string, TokenOption[]>>({});
    const [selectedChain, setSelectedChain] = useState('');
    const [selectedToken, setSelectedToken] = useState('');
    const [payrollContract, setPayrollContract] = useState('');

    const toast = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data: PayrollSettingsResponse = await fetchPayrollSettings();
            setSettings(data.settings);
            setAvailableChains(data.available_chains || []);
            setAvailableTokens(data.available_tokens || {});
            setSelectedChain(data.settings.chain);
            setSelectedToken(data.settings.payment_token);
            setPayrollContract(data.settings.token_address || '');
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updatePayrollSettings({
                chain: selectedChain,
                payment_token: selectedToken,
                token_address: payrollContract
            });
            toast.success('Settings saved successfully');
            loadSettings();
        } catch (err: any) {
            toast.error(err.response?.data?.msg || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const getCurrentTokens = (): TokenOption[] => {
        return availableTokens[selectedChain] || [];
    };

    const getSelectedTokenDetails = (): TokenOption | null => {
        const tokens = getCurrentTokens();
        return tokens.find(t => t.symbol === selectedToken) || null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const tokenDetails = getSelectedTokenDetails();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Configure system settings and preferences</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <SettingsIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Payroll Settings</h2>
                        <p className="text-sm text-gray-500">Configure blockchain and payment token for payroll</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Chain Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blockchain Chain <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedChain}
                            onChange={(e) => {
                                setSelectedChain(e.target.value);
                                setSelectedToken(''); // Reset token when chain changes
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Select a chain...</option>
                            {availableChains.map((chain) => (
                                <option key={chain.id} value={chain.id}>
                                    {chain.name} (Chain ID: {chain.chain_id})
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Select the blockchain network for payroll payments
                        </p>
                    </div>

                    {/* Token Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Token <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedToken}
                            onChange={(e) => setSelectedToken(e.target.value)}
                            disabled={!selectedChain}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Select a token...</option>
                            {getCurrentTokens().map((token) => (
                                <option key={token.symbol} value={token.symbol}>
                                    {token.name} ({token.symbol})
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            {selectedChain ? 'Select the token for payroll payments' : 'Please select a chain first'}
                        </p>
                    </div>

                    {/* Payroll Contract Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payroll Contract Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={payrollContract}
                            onChange={(e) => setPayrollContract(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Enter the smart contract address for payroll distribution
                        </p>
                    </div>

                    {/* Token Details Display */}
                    {tokenDetails && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-900 mb-3">Token Details</h3>
                            <dl className="space-y-2">
                                <div className="flex justify-between">
                                    <dt className="text-sm text-blue-700">Contract Address:</dt>
                                    <dd className="text-sm font-mono text-blue-900 break-all max-w-md text-right">
                                        {tokenDetails.address}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-sm text-blue-700">Decimals:</dt>
                                    <dd className="text-sm font-medium text-blue-900">{tokenDetails.decimals}</dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={handleSave}
                            disabled={saving || !selectedChain || !selectedToken || !payrollContract}
                            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
