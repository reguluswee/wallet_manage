import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Payroll Portal',
    projectId: 'YOUR_PROJECT_ID', // TODO: Get from env or user
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        ...(import.meta.env.VITE_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
});
