import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
    bscTestnet,
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
        bscTestnet,
        ...(import.meta.env.VITE_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
});
