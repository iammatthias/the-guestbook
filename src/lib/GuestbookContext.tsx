import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import { usePublicClient, useWatchContractEvent } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { parseAbiItem } from "viem";
import { useQuery } from "@tanstack/react-query";
import { sleep } from "../utils/sleep";
import { GuestbookEvent } from "../components/guestbook/types";
import { contractAddress, guestbookABI } from "../components/guestbook/constants";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// Sound effect URL - classic 90s notification sound (optional)
const NEW_MESSAGE_SOUND = "https://www.myinstants.com/media/sounds/you-got-mail.mp3";
// Set this to false to disable sound effects for accessibility
const ENABLE_SOUND_EFFECTS = false;

async function fetchWithRetry(fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error?.status !== 429) throw error;

    const delay = BASE_DELAY * Math.pow(2, MAX_RETRIES - retries);
    await sleep(delay);
    return fetchWithRetry(fn, retries - 1);
  }
}

interface GuestbookContextType {
  events: GuestbookEvent[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<any>;
  latestEntry: GuestbookEvent | null;
}

const GuestbookContext = createContext<GuestbookContextType | undefined>(undefined);

interface GuestbookProviderProps {
  children: ReactNode;
}

export function GuestbookProvider({ children }: GuestbookProviderProps) {
  const publicClient = usePublicClient();
  const [knownTransactionHashes, setKnownTransactionHashes] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);
  const prevEventsRef = useRef<GuestbookEvent[]>([]);

  // Initialize audio element only if sound effects are enabled
  useEffect(() => {
    if (ENABLE_SOUND_EFFECTS) {
      audioRef.current = new Audio(NEW_MESSAGE_SOUND);
      // Set volume to a lower level for less startling effect
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const {
    data: events = [],
    error,
    isLoading,
    refetch,
  } = useQuery<GuestbookEvent[], unknown>({
    queryKey: ["guestbook-entries"],
    queryFn: async () => {
      return await fetchWithRetry(async () => {
        if (!publicClient) throw new Error("Public client not available");

        const logs = await publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem(
            "event GuestbookSigned(uint256 indexed guestId, address indexed guest, string message, uint256 timestamp, uint256 tokenId)"
          ),
          fromBlock: 22079841n,
          toBlock: "latest",
        });

        const formattedEvents: GuestbookEvent[] = logs.map((log) => ({
          guestId: log.args?.guestId ?? 0n,
          guest: log.args?.guest as `0x${string}`,
          message: log.args?.message || "",
          timestamp: log.args?.timestamp ?? 0n,
          tokenId: log.args?.tokenId ?? 0n,
          blockNumber: log.blockNumber ?? 0n,
          transactionHash: log.transactionHash,
        }));

        // Sort events by timestamp (newest first)
        return formattedEvents.sort((a, b) => Number(b.timestamp - a.timestamp));
      });
    },
    staleTime: 5000, // Reduced stale time for more frequent updates
    refetchInterval: 10000, // Actively refetch every 10 seconds
    retry: 3,
    enabled: !!publicClient,
  });

  // Initialize known transaction hashes on first load
  useEffect(() => {
    if (events.length > 0 && !isInitializedRef.current) {
      const initialHashes = new Set(events.map((event) => event.transactionHash));
      setKnownTransactionHashes(initialHashes);
      isInitializedRef.current = true;
      prevEventsRef.current = events;
      console.log("Initialized known transaction hashes:", initialHashes.size);
    }
  }, [events]);

  // Track known transaction hashes to detect new entries
  useEffect(() => {
    // Skip if not initialized or if events haven't changed
    if (!isInitializedRef.current || events === prevEventsRef.current) {
      return;
    }

    // Create a set of all current transaction hashes
    const currentHashes = new Set(events.map((event) => event.transactionHash));

    // Find new entries by comparing with known hashes
    const newItems = events.filter((event) => !knownTransactionHashes.has(event.transactionHash));

    if (newItems.length > 0) {
      console.log("New entries detected:", newItems);

      // Play sound effect for new entries if enabled
      if (ENABLE_SOUND_EFFECTS && audioRef.current && knownTransactionHashes.size > 0) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e) => console.log("Audio play failed:", e));
        } catch (e) {
          console.log("Audio error:", e);
        }
      }

      // Update known hashes
      setKnownTransactionHashes(currentHashes);
    }

    // Update reference to current events
    prevEventsRef.current = events;
  }, [events, knownTransactionHashes]);

  // Enhanced refetch function that ensures we capture new entries
  const enhancedRefetch = useCallback(async () => {
    console.log("Manual refetch triggered");
    const result = await refetch();
    return result;
  }, [refetch]);

  // Watch for new events with more aggressive polling
  useWatchContractEvent({
    address: contractAddress,
    abi: guestbookABI,
    eventName: "GuestbookSigned",
    chainId: baseSepolia.id,
    poll: true,
    pollingInterval: 2_000, // Poll every 2 seconds
    onLogs: async (logs) => {
      console.log("New logs detected:", logs);
      await enhancedRefetch();
    },
  });

  const latestEntry = events.length > 0 ? events[0] : null;

  const value = {
    events,
    isLoading,
    error,
    refetch: enhancedRefetch,
    latestEntry,
  };

  return <GuestbookContext.Provider value={value}>{children}</GuestbookContext.Provider>;
}

export function useGuestbook() {
  const context = useContext(GuestbookContext);
  if (context === undefined) {
    throw new Error("useGuestbook must be used within a GuestbookProvider");
  }
  return context;
}
