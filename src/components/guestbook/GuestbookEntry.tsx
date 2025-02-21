import { GuestbookEvent } from "./types";
import { AddressDisplay } from "./AddressDisplay";
import styles from "./Guestbook.module.css";
import { contractAddress } from "./constants";

interface GuestbookEntryProps {
  event: GuestbookEvent;
}

export function GuestbookEntry({ event }: GuestbookEntryProps) {
  return (
    <article className={styles.guestEntry}>
      <div className='flex-between'>
        <small>{new Date(Number(event.timestamp * 1000n)).toLocaleString()}</small>
        <small>
          <a href={`https://sepolia.basescan.org/block/${event.blockNumber}`} target='_blank' rel='noopener noreferrer'>
            Block {event.blockNumber.toString()}
          </a>
        </small>
      </div>

      <div className='flex-col'>
        <p>{event.message || "gm"}</p>
        <p className={styles.author} data-guest={event.guestId}>
          by <AddressDisplay address={event.guest} />
        </p>
      </div>

      <div className='flex-between'>
        <small>
          <a
            href={`https://sepolia.basescan.org/tx/${event.transactionHash}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            BaseScan
          </a>
        </small>
        {event.tokenId > 0n && (
          <small>
            <a
              href={`https://testnets.opensea.io/assets/base_sepolia/${contractAddress}/${event.tokenId}`}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.nftLink}
            >
              OpenSea
            </a>
          </small>
        )}
      </div>
    </article>
  );
}
