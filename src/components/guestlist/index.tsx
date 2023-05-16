// get the guestlist from the contract and display
// we'll be using useReadContract from `wagmi`

import { useContractRead, useEnsName } from "wagmi";
import { fromHex } from "viem";
import Sparkles from "react-sparkle";
import styles from "./guestlist.module.css";

export default function GuestList() {
  const { data, isError, isLoading } = useContractRead({
    address: import.meta.env.VITE_CONTRACT_BASE_GOERLI,
    chainId: 11155111,
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

  if (isError) {
    return <div>Error!</div>;
  }

  const sortedData = data
    ?.map((guest: any) => {
      return {
        guest: guest.guest,
        message: guest.message,
        timestamp: `${guest.timestamp}`,
        isSponsored: guest.isSponsored,
      };
    })
    .reverse();

  // find the 1 most recent sponsored guest and put them at the top
  const sponsoredGuest = sortedData?.find((guest: any) => guest.isSponsored);
  const sponsoredGuestIndex = sortedData?.indexOf(sponsoredGuest as any);
  if (sponsoredGuestIndex !== undefined && sponsoredGuestIndex !== -1) {
    sortedData?.splice(sponsoredGuestIndex, 1);
    sortedData?.unshift(sponsoredGuest as any);
  }

  function getGuestName(address: string) {
    const {
      data: name,
      isError,
      isLoading,
    } = useEnsName({
      address: address as any,
      chainId: 1,
    });
    if (isLoading) {
      return address;
    }
    if (isError) {
      return address;
    }
    return name;
  }

  return (
    <>
      {sortedData?.map((guest: any, index) => (
        <div key={index} className={`${styles.guestlist}`}>
          <div className={`${styles.guestlist__address}`}>
            {getGuestName(guest.guest)}
          </div>
          <div
            className={`${styles.guestlist__timestamp}`}>{`${guest.timestamp}`}</div>

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
