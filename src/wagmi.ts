import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    rainbowWallet,
    metaMaskWallet,
    coinbaseWallet,
    uniswapWallet,
} from '@rainbow-me/rainbowkit/wallets';
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
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [
                rainbowWallet,
                metaMaskWallet,
                coinbaseWallet,
                uniswapWallet,
            ],
        },
    ],
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
