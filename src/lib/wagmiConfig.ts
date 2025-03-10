import { http } from "wagmi";
import { baseSepolia, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Ensure environment variable is available
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  console.error("Missing VITE_WALLETCONNECT_PROJECT_ID environment variable");
}

export const config = getDefaultConfig({
  appName: "iammatthias.com",
  projectId: projectId || "development-only-project-id",
  chains: [baseSepolia, mainnet],
  transports: {
    [baseSepolia.id]: http("https://rpc.ankr.com/base_sepolia"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
  },
  ssr: true, // Enable server-side rendering support
});
