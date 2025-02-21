import { GuestbookEvent } from "./types";
import { GuestbookEntry } from "./GuestbookEntry";

interface EventsListProps {
  events: GuestbookEvent[];
  isLoadingEvents: boolean;
}

export function EventsList({ events, isLoadingEvents }: EventsListProps) {
  if (isLoadingEvents) {
    return <p>Loading previous signatures...</p>;
  }

  if (events.length === 0) {
    return <p>No signatures yet. Be the first to sign!</p>;
  }

  return (
    <>
      {events.map((event) => (
        <GuestbookEntry key={`${event.guestId}-${event.timestamp}`} event={event} />
      ))}
    </>
  );
}
