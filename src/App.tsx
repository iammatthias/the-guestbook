import { useEffect, useState } from "react";
import { useNetwork, useSwitchNetwork, useWalletClient } from "wagmi";
import { Chain } from "viem";
import { baseGoerli } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GuestList from "./components/guestlist";
import Faq from "./components/faq";
import SignTheGuestlist from "./components/signTheGuestlist";

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
};

const TARGET_CHAINS: Chain[] = [baseGoerli, zoraGoerli];

function App() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();
  const { data: walletClient } = useWalletClient();

  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (
      chain &&
      TARGET_CHAINS.some((targetChain) => targetChain.id === chain.id)
    ) {
      setIsSwitching(false);
    }
  }, [chain]);

  const handleSwitchChain = async (chainId: number) => {
    const desiredChain = chains.find((chain) => chain.id === chainId);

    if (desiredChain) {
      setIsSwitching(true);
      try {
        if (switchNetwork) {
          switchNetwork(desiredChain.id);
          setIsSwitching(false);
        }
      } catch (error) {
        console.error("Error switching chain:", error);
        setIsSwitching(false);
      }
    } else {
      const chainToAdd = TARGET_CHAINS.find((chain) => chain.id === chainId);
      if (chainToAdd) {
        walletClient
          ?.addChain({ chain: chainToAdd })
          .then(() => {
            handleSwitchChain(chainId);
          })
          .catch((error) => {
            console.error(
              `Error adding chain ${chainToAdd.name} to wallet. See console for details.`,
              error
            );
          });
      } else {
        console.error("Desired chain is not configured.");
      }
    }
  };

  return (
    <>
      <div className='header'>
        <ConnectButton chainStatus='none' />
      </div>

      <main>
        <h1>The Guestbook</h1>
        <h2 className='tagline'>
          Connect your wallet to leave your mark and become a part of an
          ever-growing tapestry of thoughts, stories, and experiences.
        </h2>
        {chain ? (
          chain.id == 1 ? (
            <div className='alert'>
              <p>Please switch to another network</p>
            </div>
          ) : (
            <div className='banner'>
              Current Chain: {chain.name} ({chain.id})
            </div>
          )
        ) : (
          <div className='alert'>Not connected</div>
        )}

        {chain && (
          <div className='chain__buttons'>
            {chains.map(
              (x) =>
                x.id !== 1 && (
                  <button
                    disabled={
                      !switchNetwork || x.id === chain?.id || isSwitching
                    }
                    key={x.id}
                    onClick={() => handleSwitchChain(x.id)}>
                    {x.id === chain?.id && "Connected to "}
                    {x.name}
                    {isLoading && pendingChainId === x.id && " (switching)"}
                  </button>
                )
            )}
          </div>
        )}

        <div>{error && error.message}</div>

        <Faq />
        <SignTheGuestlist />
        <GuestList />
      </main>
    </>
  );
}

export default App;
