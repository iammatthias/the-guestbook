import WagmiProvider from "./lib/WagmiProvider";
import Guestbook from "./components/guestbook";
import Head from "./components/Head";
import { GuestbookProvider } from "./lib/GuestbookContext";

function App() {
  return (
    <>
      <Head>
        <title>The Guestbook</title>
        <meta name='description' content='Leave your message onchain' />
        <meta name='keywords' content='guestbook, web3, blockchain, 90s, retro, nostalgia' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='theme-color' content='#000033' />
        <meta name='author' content='@iammatthias' />
        {/* Frame Embed */}
        <meta
          name='fc:frame'
          content='{"version":"next","imageUrl":"https://theguestbook.xyz/image.png","button":{"title":"Explore","action":{"type":"launch_frame","name":"Explore","url":"https://theguestbook.xyz","splashImageUrl":"https://theguestbook.xyz/splash.png","splashBackgroundColor":"#000033"}}}'
        />
      </Head>
      <WagmiProvider>
        <GuestbookProvider>
          <Guestbook />
        </GuestbookProvider>
      </WagmiProvider>
    </>
  );
}

export default App;
