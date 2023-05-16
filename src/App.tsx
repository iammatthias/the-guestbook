import { useEffect } from "react";
import { useNetwork, useSwitchNetwork, useWalletClient } from "wagmi";
import { baseGoerli } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GuestList from "./components/guestlist";
import Faq from "./components/faq";
import SignTheGuestlist from "./components/signTheGuestlist";

function App() {
  const { chain } = useNetwork();
  const { switchNetwork, chains } = useSwitchNetwork();
  const { data: walletClient, isLoading } = useWalletClient();

  // On initial load, check if we are on chainId 84531. If not, switch the chain.
  useEffect(() => {
    if (chain && chain.id !== 84531 && switchNetwork) {
      // Check if the desired chain is available
      const desiredChain = chains.find((chain) => chain.id === 84531);

      if (desiredChain) {
        // If the desired chain is available and the wallet supports switching, switch to it
        switchNetwork(84531);
      } else {
        // If the desired chain is not available, add it (assuming the wallet supports adding new chains)
        walletClient
          ?.addChain({ chain: baseGoerli })
          .then(() => {
            // After the user has confirmed and the chain has been added, switch to the new chain
            switchNetwork(84531);
          })
          .catch((error) => {
            // Handle any errors that occur when trying to add the chain
            alert(
              "Error adding chain Base Goerli to wallet. See console for details."
            );
            console.error(error);
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: "70ch",
          margin: "0 auto",
        }}>
        <h1>The Guestbook</h1>
        {/* subtitle */}
        <h2 style={{ color: "gray", fontSize: 12 }}>
          Connect your wallet to leave your mark and become a part of an
          ever-growing tapestry of thoughts, stories, and experiences.
        </h2>

        <Faq />
        <SignTheGuestlist />
        <GuestList />
      </div>
    </>
  );
}

export default App;
