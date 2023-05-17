import { useContractRead, useEnsName } from "wagmi";
import { fromHex } from "viem";
import Sparkles from "react-sparkle";
import styles from "./guestlist.module.css";

// Environment Variables and Constants
const CONTRACT = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const TARGET_CHAIN_ID = 84531;

function GuestName({ address }: { address: string }) {
  const { data: name, isLoading } = useEnsName({
    address: address as any,
    chainId: 1,
  });
  return <>{isLoading ? address : name}</>;
}

export default function GuestList() {
  const { data, isError, isLoading } = useContractRead({
    address: CONTRACT,
    chainId: TARGET_CHAIN_ID,
    functionName: "getAllGuests",
    watch: true,
    abi: [
      {
        inputs: [],
        name: "getAllGuests",
        outputs: [
          {
            components: [
              {
                internalType: "address",
                name: "guest",
                type: "address",
              },
              {
                internalType: "string",
                name: "message",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isSponsored",
                type: "bool",
              },
            ],
            internalType: "struct TheGuestbook.Guestbook[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div>Error!</div>;
  }

  const sortedData = data
    ?.map((guest: any) => ({
      guest: guest.guest,
      message: guest.message,
      timestamp: `${guest.timestamp}`,
      isSponsored: guest.isSponsored,
    }))
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .reduce((arr: any[], item: any) => {
      if (item.isSponsored && !arr.some((i) => i.isSponsored)) {
        return [item, ...arr];
      }
      return [...arr, item];
    }, [] as any[]);

  return (
    <>
      {sortedData?.map((guest: any, index) => (
        <div
          key={guest.guest + guest.timestamp}
          className={`${styles.guestlist}`}>
          <div className={`${styles.guestlist__address}`}>
            <a href={`https://rainbow.me/${guest.guest}`}>
              <GuestName address={guest.guest} />
            </a>
          </div>
          <div className={`${styles.guestlist__timestamp}`}>
            {/* 12:00 Jan 1, 2023 format the timestamp like this */}
            {new Date(parseInt(guest.timestamp) * 1000).toLocaleTimeString(
              "en-US",
              {
                hour: "numeric",
                minute: "numeric",
              }
            )}{" "}
            •{" "}
            {new Date(parseInt(guest.timestamp) * 1000).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </div>

          {/* convert the message hex to ascii */}
          <div className={`${styles.guestlist__message}`}>
            {fromHex(`0x${guest.message}`, "string")}
          </div>
          {guest.isSponsored && (
            <>
              <div className={`${styles.guestlist__sponsored}`}>
                Sponsored Content
              </div>

              {index === 0 && (
                <Sparkles
                  color='#DAA520'
                  count={20}
                  minSize={7}
                  maxSize={12}
                  overflowPx={8}
                  fadeOutSpeed={30}
                  flicker={false}
                />
              )}
            </>
          )}
        </div>
      ))}
    </>
  );
}
