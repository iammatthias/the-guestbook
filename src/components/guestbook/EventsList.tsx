import { useState } from "react";
import { GuestbookEvent } from "./types";
import { GuestbookEntry } from "./GuestbookEntry";
import styles from "./Guestbook.module.css";
import { useGuestbook } from "../../lib/GuestbookContext";

interface EventsListProps {
  isLoadingEvents: boolean;
}

export function EventsList({ isLoadingEvents }: EventsListProps) {
  const { events } = useGuestbook();

  if (isLoadingEvents) {
    return (
      <div className='flex-center' style={{ padding: "2rem" }}>
        <div style={{ animation: "blink 1s infinite", fontWeight: "bold" }}>⌛ LOADING PREVIOUS SIGNATURES... ⌛</div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div style={{ fontWeight: "bold" }}>No signatures yet. Be the first to sign!</div>
        <div style={{ marginTop: "1rem" }}>
          <div className={styles.underConstruction}>COMING SOON</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.entriesContainer}>
      {events.map((event) => (
        <GuestbookEntry key={`${event.guestId}-${event.timestamp}-${event.transactionHash}`} event={event} />
      ))}

      <div className='flex-center' style={{ marginTop: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>-- End of Guestbook Entries --</div>
      </div>
    </div>
  );
}
