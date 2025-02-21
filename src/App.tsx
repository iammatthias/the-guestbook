import WagmiProvider from "./lib/WagmiProvider";
import Guestbook from "./components/guestbook";

function App() {
  return (
    <WagmiProvider>
      <Guestbook />
    </WagmiProvider>
  );
}

export default App;
