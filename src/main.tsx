import "./polyfills";
import "./global.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, sepolia, baseGoerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const { chains, publicClient } = configureChains(
  [baseGoerli],
  [alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "The Guestbook",
  projectId: import.meta.env.VITE_WALLETCONNECT,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          fontStack: "system",
        })}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
