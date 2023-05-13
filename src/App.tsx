import { ConnectButton } from "@rainbow-me/rainbowkit";
import GuestList from "./components/guestlist";
import Faq from "./components/faq";
import SignTheGuestlist from "./components/signTheGuestlist";

function App() {
  return (
    <>
      <div className='header'>
        <ConnectButton chainStatus={`none`} />
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
        <h1>Guestbook</h1>
        {/* subtitle */}
        <h2>
          <span style={{ color: "gray", fontSize: 12 }}>
            Connect your wallet to leave your mark and become a part of an
            ever-growing tapestry of thoughts, stories, and experiences.
          </span>
        </h2>

        <Faq />
        <SignTheGuestlist />
        <GuestList />
      </div>
    </>
  );
}

export default App;
