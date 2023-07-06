import { useNetwork } from "wagmi";
import { Chain } from "viem";
import { mainnet, baseGoerli, zoraTestnet } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import GuestList from "./components/guestlist";
import Faq from "./components/faq";
import SignTheGuestlist from "./components/signTheGuestlist";
import Airdrop from "./components/airdrop";

const TARGET_CHAINS: Chain[] = [mainnet, baseGoerli, zoraTestnet];

function App() {
  const { chain } = useNetwork();

  return (
    <>
      <main>
        <h1>The Guestbook</h1>
        <h2 className='tagline'>
          Connect your wallet to leave your mark and become a part of an
          ever-growing tapestry of thoughts, stories, and experiences.
        </h2>
        <div className='header'>
          <ConnectButton />
        </div>
        {chain ? (
          <div className='banner'>
            Current Chain: {chain.name} ({chain.id})
          </div>
        ) : (
          <div className='alert'>Not connected</div>
        )}

        {/* Airdrop */}
        {chain && <Airdrop />}

        <Faq />

        {chain && <SignTheGuestlist />}
        <GuestList />
      </main>
    </>
  );
}

export default App;
