import "./polyfills";
import "./reset.css";
import "./global.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { Chain } from "viem";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Environment Variables
const VITE_ALCHEMY = import.meta.env.VITE_ALCHEMY;
const VITE_WALLETCONNECT = import.meta.env.VITE_WALLETCONNECT;

export const zoraGoerli: Chain = {
  id: 999,
  name: "Zora Goerli",
  network: "goerli",
  nativeCurrency: {
    decimals: 18,
    name: "Goerli Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://testnet.rpc.zora.co/"] },
    default: { http: ["https://testnet.rpc.zora.co/"] },
  },
  blockExplorers: {
    etherscan: { name: "Blockscout", url: "https://testnet.explorer.zora.co/" },
    default: { name: "Blockscout", url: "https://testnet.explorer.zora.co/" },
  },
};

const { chains, publicClient } = configureChains(
  [mainnet, baseGoerli, zoraGoerli],
  [alchemyProvider({ apiKey: VITE_ALCHEMY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "The Guestbook",
  projectId: VITE_WALLETCONNECT,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          fontStack: "system",
          borderRadius: "none",
          accentColor: "#ffd700",
          accentColorForeground: "#1c1c1c",
        })}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
