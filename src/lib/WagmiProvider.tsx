import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider as WagmiConfig } from "wagmi";
import { config } from "./wagmiConfig";
import { type ReactNode } from "react";
import { RainbowKitProvider, darkTheme, Theme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { baseSepolia } from "wagmi/chains";
const queryClient = new QueryClient();

// Create a custom 90s theme by extending the dark theme
const nostalgiaTheme = {
  ...darkTheme(),
  colors: {
    accentColor: "#ff00ff", // Magenta
    accentColorForeground: "#ffffff",
    actionButtonBorder: "#00ff00", // Lime
    actionButtonBorderMobile: "#00ff00",
    actionButtonSecondaryBackground: "#800080", // Purple
    closeButton: "#ffffff",
    closeButtonBackground: "#ff0000", // Red
    connectButtonBackground: "#ff0000", // Red
    connectButtonBackgroundError: "#ff0000",
    connectButtonInnerBackground: "#000080", // Navy
    connectButtonText: "#ffffff",
    connectButtonTextError: "#ffffff",
    connectionIndicator: "#00ff00", // Lime
    downloadBottomCardBackground: "#000080", // Navy
    downloadTopCardBackground: "#008080", // Teal
    error: "#ff0000", // Red
    generalBorder: "#00ff00", // Lime
    generalBorderDim: "#00ff00",
    menuItemBackground: "#800080", // Purple
    modalBackdrop: "rgba(0, 0, 0, 0.8)",
    modalBackground: "#000080", // Navy
    modalBorder: "#00ff00", // Lime
    modalText: "#ffffff",
    modalTextDim: "#ffa500", // Orange
    modalTextSecondary: "#ffff00", // Yellow
    profileAction: "#008080", // Teal
    profileActionHover: "#800080", // Purple
    profileForeground: "#000080", // Navy
    selectedOptionBorder: "#00ff00", // Lime
    standby: "#ffa500", // Orange
  },
  fonts: {
    body: '"Courier New", monospace',
  },
  radii: {
    actionButton: "0px", // Sharp corners
    connectButton: "0px",
    menuButton: "0px",
    modal: "0px",
    modalMobile: "0px",
  },
  shadows: {
    connectButton: "3px 3px 0 #000000",
    dialog: "5px 5px 0 #000000",
    profileDetailsAction: "3px 3px 0 #000000",
    selectedOption: "3px 3px 0 #000000",
    selectedWallet: "3px 3px 0 #000000",
    walletLogo: "3px 3px 0 #000000",
  },
} as Theme;

interface Props {
  children: ReactNode;
}

export default function WagmiProvider({ children }: Props) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={baseSepolia} theme={nostalgiaTheme} modalSize='compact'>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
