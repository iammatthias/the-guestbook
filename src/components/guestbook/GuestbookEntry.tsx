import { useEffect, useState, useRef } from "react";
import { GuestbookEvent } from "./types";
import { AddressDisplay } from "./AddressDisplay";
import styles from "./Guestbook.module.css";
import { contractAddress } from "./constants";
import { useGuestbook } from "../../lib/GuestbookContext";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

interface GuestbookEntryProps {
  event: GuestbookEvent;
}

export function GuestbookEntry({ event }: GuestbookEntryProps) {
  const { events } = useGuestbook();
  const [isNew, setIsNew] = useState(false);
  const entryRef = useRef<HTMLElement>(null);
  const processedRef = useRef(false);
  const prevEventsLengthRef = useRef(0);
  const isInitialRenderRef = useRef(true);

  // Fetch ENS name for this entry's address
  const { data: ensName } = useEnsName({
    address: event.guest,
    chainId: mainnet.id, // Explicitly use Ethereum mainnet for ENS resolution
  });

  // Random 90s icon for each entry (using Unicode symbols)
  const icons = ["◆", "◇", "■", "□", "▲", "△", "●", "○", "★", "☆"];
  const randomIcon = icons[Number(event.guestId) % icons.length];

  // Check if this is the newest entry in the entire list
  const isNewestEntry = events.length > 0 && events[0].transactionHash === event.transactionHash;

  // Mark the newest entry as "new" and keep it that way until a newer entry is added
  useEffect(() => {
    // Skip if events haven't changed
    if (events.length === prevEventsLengthRef.current) {
      return;
    }

    // Update events length reference
    prevEventsLengthRef.current = events.length;

    // If this is the newest entry and we haven't processed it yet
    if (isNewestEntry && !processedRef.current) {
      console.log("This is the newest entry overall:", event);
      setIsNew(true);
      processedRef.current = true;

      // Only scroll to the new entry if it's not the initial render
      if (entryRef.current && !isInitialRenderRef.current) {
        entryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    // If this was previously marked as new but is no longer the newest entry
    else if (isNew && !isNewestEntry) {
      console.log("This entry is no longer the newest:", event);
      setIsNew(false);
    }

    // After the first render, set the flag to false
    isInitialRenderRef.current = false;
  }, [events.length, event, isNew, isNewestEntry]);

  // Display name is ENS name if available, otherwise use AddressDisplay component
  const displayName = ensName ? (
    <a
      href={`https://sepolia.basescan.org/address/${event.guest}`}
      target='_blank'
      rel='noopener noreferrer'
      className={styles.addressLink}
      title={event.guest}
    >
      {ensName}
    </a>
  ) : (
    <AddressDisplay address={event.guest} />
  );

  return (
    <article ref={entryRef} className={`${styles.guestEntry} ${isNew ? "guestbook-entry new" : "guestbook-entry"}`}>
      {isNew && <div className='new-entry-indicator'>LATEST GUEST</div>}
      <div className='flex-between'>
        <small>
          {randomIcon} {new Date(Number(event.timestamp * 1000n)).toLocaleString()}
        </small>
        <small>
          <a href={`https://sepolia.basescan.org/block/${event.blockNumber}`} target='_blank' rel='noopener noreferrer'>
            Block {event.blockNumber.toString()}
          </a>
        </small>
      </div>

      <div className='flex-col'>
        <div className='pixel-divider'></div>
        <p>{event.message || "gm"}</p>
        <div className='pixel-divider'></div>
        <p className={styles.author} data-guest={event.guestId}>
          by {displayName}
        </p>
      </div>

      <div className='flex-between'>
        <small>
          <a
            href={`https://sepolia.basescan.org/tx/${event.transactionHash}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            ⌕ BaseScan
          </a>
        </small>
        {event.tokenId > 0n && (
          <small>
            <a
              href={`https://testnets.opensea.io/assets/base_sepolia/${contractAddress}/${event.tokenId}`}
              target='_blank'
              rel='noopener noreferrer'
              className={`${styles.nftLink} ${styles.blinkingLink}`}
            >
              ◈ View on OpenSea
            </a>
          </small>
        )}
      </div>
    </article>
  );
}
