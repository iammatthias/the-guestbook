import { useAccount, useReadContract, usePublicClient, useWatchContractEvent } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Guestbook.module.css";
import { SigningForm } from "./SigningForm";
import { EventsList } from "./EventsList";
import { GuestbookEvent } from "./types";
import { contractAddress, guestbookABI } from "./constants";
import { parseAbiItem } from "viem";
import { useQuery } from "@tanstack/react-query";
import { sleep } from "../../utils/sleep";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

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

export default function GuestbookContent() {
  const { isConnected, chain } = useAccount();
  const publicClient = usePublicClient();

  // Check if connected to correct network
  const isWrongNetwork = isConnected && chain?.id !== baseSepolia.id;

  // Contract read hooks
  const { data: isPaused } = useReadContract({
    address: contractAddress,
    abi: guestbookABI,
    functionName: "paused",
    chainId: baseSepolia.id,
  });

  const {
    data: events = [],
    error: queryError,
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

        return formattedEvents.sort((a, b) => Number(b.timestamp - a.timestamp));
      });
    },
    staleTime: 10000,
    retry: 3,
    enabled: !!publicClient,
  });

  // Watch for new events
  useWatchContractEvent({
    address: contractAddress,
    abi: guestbookABI,
    eventName: "GuestbookSigned",
    chainId: baseSepolia.id,
    poll: true,
    pollingInterval: 2_000,
    onLogs: async () => {
      await refetch();
    },
  });

  if (queryError || !publicClient) {
    return <div>Error loading guestbook entries. Please try again later.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.guestbookContainer}>
      <section className={styles.section}>
        <img className='hero' src='/guestbook.png' alt='Guestbook' />
      </section>
      <section className={styles.section}>
        <p>
          Sign the guestbook with a "gm" on Base (free) or leave a message (0.00111 Ξ), mint it if you want (0.00111 Ξ).
          Don't be a jerk — harmful content will be moderated. Onchain gas fees still apply.
        </p>
        <ConnectButton
          chainStatus='name'
          showBalance={false}
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
        {isConnected && !isWrongNetwork && <SigningForm isPaused={isPaused} onSuccess={refetch} />}
        {isWrongNetwork && (
          <div className={styles.error}>Please connect to Base Sepolia network to interact with the guestbook</div>
        )}
      </section>

      <section className={styles.section}>
        {queryError ? (
          <div className={styles.error}>
            {queryError instanceof Error ? queryError.message : "An error occurred while loading entries"}
          </div>
        ) : (
          <EventsList events={events} isLoadingEvents={isLoading} />
        )}
      </section>
    </div>
  );
}
