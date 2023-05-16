import { useEffect } from "react";
import { useNetwork, useSwitchNetwork, useWalletClient } from "wagmi";
import { baseGoerli } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GuestList from "./components/guestlist";
import Faq from "./components/faq";
import SignTheGuestlist from "./components/signTheGuestlist";

const TARGET_CHAIN_ID = 84531;

function App() {
  const { chain } = useNetwork();
  const { switchNetwork, chains } = useSwitchNetwork();
  const { data: walletClient, isLoading } = useWalletClient();

  // On initial load, check if we are on chainId 84531. If not, switch the chain.
  useEffect(() => {
    if (chain && chain.id !== TARGET_CHAIN_ID && switchNetwork) {
      const desiredChain = chains.find((chain) => chain.id === TARGET_CHAIN_ID);

      if (desiredChain) {
        switchNetwork(TARGET_CHAIN_ID);
      } else {
        walletClient
          ?.addChain({ chain: baseGoerli })
          .then(() => {
            switchNetwork(TARGET_CHAIN_ID);
          })
          .catch((error) => {
            console.error(
              "Error adding chain Base Goerli to wallet. See console for details.",
              error
            );
          });
      }
    }
  }, [chain, switchNetwork]);

  return (
    <>
      <div className='header'>
        <ConnectButton />
      </div>

      {/* a column with a max width of 70ch */}
      <main>
        <h1>The Guestbook</h1>
        {/* subtitle */}
        <h2 className='tagline'>
          Connect your wallet to leave your mark and become a part of an
          ever-growing tapestry of thoughts, stories, and experiences.
        </h2>

        <Faq />
        <SignTheGuestlist />
        <GuestList />
      </main>
    </>
  );
}

export default App;
