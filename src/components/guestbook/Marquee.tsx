import { useEffect, useState, useRef, useCallback } from "react";
import { useGuestbook } from "../../lib/GuestbookContext";
import { GuestbookEvent } from "./types";
import { AddressDisplay } from "./AddressDisplay";
import styles from "./Guestbook.module.css";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

export function Marquee() {
  const { events, latestEntry } = useGuestbook();
  const [displayEntry, setDisplayEntry] = useState<GuestbookEvent | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevLatestEntryHashRef = useRef<string | null>(null);

  // Fetch ENS name for the displayed entry's address
  const { data: ensName } = useEnsName({
    address: displayEntry?.guest,
    chainId: mainnet.id, // Explicitly use Ethereum mainnet for ENS resolution
  });

  // Update the displayed entry when new entries come in
  useEffect(() => {
    // Skip if no latest entry
    if (!latestEntry) {
      return;
    }

    const latestHash = latestEntry.transactionHash;

    // Check if we have a new latest entry by comparing transaction hashes
    if (prevLatestEntryHashRef.current !== latestHash) {
      console.log("New entry detected in Marquee, updating display:", latestEntry);
      setDisplayEntry(latestEntry);

      // Only highlight if it's not the initial load
      if (prevLatestEntryHashRef.current !== null) {
        setIsHighlighted(true);

        // Reset highlight after animation, but keep the pulsing effect longer
        const timer = setTimeout(() => {
          setIsHighlighted(false);
        }, 15000); // Increased from 5000 to 15000 ms to keep the pulsing animation longer

        return () => clearTimeout(timer);
      }

      // Update our reference to the current latest entry hash
      prevLatestEntryHashRef.current = latestHash;
    }
  }, [latestEntry]);

  // Format the message for display
  const formatMessage = useCallback(() => {
    if (!displayEntry) return { message: "No messages yet", time: "Never", address: undefined };

    const message = displayEntry.message || "gm";
    const truncatedMessage = message.length > 20 ? message.substring(0, 20) + "..." : message;
    const time = new Date(Number(displayEntry.timestamp * 1000n)).toLocaleString();

    return {
      message: truncatedMessage,
      time,
      address: displayEntry.guest,
    };
  }, [displayEntry]);

  const { message, time, address } = formatMessage();

  // Display name is ENS name if available, otherwise the address
  const displayName =
    ensName && address ? (
      <a
        href={`https://sepolia.basescan.org/address/${address}`}
        target='_blank'
        rel='noopener noreferrer'
        className={styles.addressLink}
        title={address}
      >
        {ensName}
      </a>
    ) : address ? (
      <AddressDisplay address={address} />
    ) : (
      "Anonymous"
    );

  // Create the message content - same for both header and footer
  const messageContent = (
    <>
      ★ BUILT ON BASE WITH ONCHAIN TECHNOLOGY ★ {events?.length || 0} VISITORS HAVE SIGNED ★ COLLECT YOUR MESSAGE
      ONCHAIN ★ POWERED BY ETHEREUM ★ {isHighlighted && <span className='new-message-indicator'>NEW MESSAGE! </span>}
      LAST MESSAGE POSTED: "{message}" BY {displayName} AT {time} ★
    </>
  );

  return (
    <div className={`marquee ${isHighlighted ? "new" : ""}`}>
      <div className={`marquee-content ${isHighlighted ? "highlighted" : ""}`}>{messageContent}</div>
    </div>
  );
}
