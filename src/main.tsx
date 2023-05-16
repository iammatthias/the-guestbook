import "./polyfills";
import "./reset.css";
import "./global.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
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

const { chains, publicClient } = configureChains(
  [mainnet, baseGoerli],
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
