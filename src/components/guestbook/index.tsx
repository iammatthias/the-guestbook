import { useAccount, useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Guestbook.module.css";
import { SigningForm } from "./SigningForm";
import { EventsList } from "./EventsList";
import { contractAddress, guestbookABI } from "./constants";
import { useGuestbook } from "../../lib/GuestbookContext";
import { Marquee } from "./Marquee";

export default function GuestbookContent() {
  const { isConnected, chain } = useAccount();
  const { isLoading, error: queryError, refetch } = useGuestbook();

  // Check if connected to correct network
  const isWrongNetwork = isConnected && chain?.id !== baseSepolia.id;

  // Contract read hooks
  const { data: isPaused } = useReadContract({
    address: contractAddress,
    abi: guestbookABI,
    functionName: "paused",
    chainId: baseSepolia.id,
  });

  return (
    <>
      <img className='hero' src='/guestbook.png' alt='Guestbook' />
      <Marquee />

      <section className={styles.section}>
        <div className='pixel-divider'></div>
        <p>
          Sign the guestbook on Base with a "gm" or leave a message (0.00111 Ξ), mint it if you want (0.00111 Ξ). Don't
          be a jerk — harmful content will be moderated. Onchain gas fees still apply.
        </p>
        <div className='pixel-divider'></div>

        <div className='flex-center'>
          <div className={styles.connectButtonWrapper}>
            <ConnectButton
              chainStatus='none'
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>
        </div>

        {isConnected && !isWrongNetwork && <SigningForm isPaused={isPaused} onSuccess={refetch} />}
        {isWrongNetwork && (
          <div className={styles.error}>Please connect to Base Sepolia network to interact with the guestbook</div>
        )}
      </section>

      {queryError ? (
        <div className={styles.error}>
          {queryError instanceof Error ? queryError.message : "An error occurred while loading entries"}
        </div>
      ) : isLoading ? (
        <div className='flex-center'>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinnerText}>⌛ LOADING... ⌛</div>
            <div className={styles.spinnerGraphic}>
              <div className={styles.spinnerBar}></div>
              <div className={styles.spinnerBar}></div>
              <div className={styles.spinnerBar}></div>
              <div className={styles.spinnerBar}></div>
            </div>
          </div>
        </div>
      ) : (
        <section>
          <h2 className='flex-center'>✎ GUESTBOOK ENTRIES ✎</h2>
          <EventsList isLoadingEvents={isLoading} />
        </section>
      )}

      <footer className='flex-center' style={{ marginTop: "2rem" }}>
        <Marquee />
      </footer>
    </>
  );
}
