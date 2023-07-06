import { useContractRead, useEnsName } from "wagmi";
import { fromHex, Chain } from "viem";
import Sparkles from "react-sparkle";
import styles from "./guestlist.module.css";

export const zoraGoerli: Chain = {
  id: 999,
  name: "Zora Goerli",
  network: "goerli",
  nativeCurrency: {
    decimals: 18,
    name: "Goerli Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://testnet.rpc.zora.co/"] },
    default: { http: ["https://testnet.rpc.zora.co/"] },
  },
};

// Environment Variables and Constants
const BASE_CONTRACT = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const BASE_CHAIN_ID = 84531;
const ZORA_CONTRACT = import.meta.env.VITE_CONTRACT_ZORA_GOERLI;
const ZORA_CHAIN_ID = 999;

function GuestName({ address }: { address: string }) {
  const { data: name } = useEnsName({
    address: address as any,
    chainId: 1,
  });
  return <>{name ? name : address}</>;
}

export default function GuestList() {
  const {
    data: baseData,
    isError: baseIsError,
    isLoading: baseIsLoading,
  } = useContractRead({
    address: BASE_CONTRACT,
    chainId: BASE_CHAIN_ID,
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
  }) as any;

  const {
    data: zoraData,
    isError: zoraIsError,
    isLoading: zoraIsLoading,
  } = useContractRead({
    address: ZORA_CONTRACT,
    chainId: ZORA_CHAIN_ID,
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
  }) as any;

  if (baseIsLoading || zoraIsLoading) {
    return <div>Loading...</div>;
  }

  if (baseIsError || zoraIsError) {
    return <div>Error!</div>;
  }

  const baseDataFormatted = baseData?.map((guest: any) => ({
    guest: guest.guest,
    message: guest.message,
    timestamp: `${guest.timestamp}`,
    isSponsored: guest.isSponsored,
    contract: "Base",
  }));

  const zoraDataFormatted = zoraData?.map((guest: any) => ({
    guest: guest.guest,
    message: guest.message,
    timestamp: `${guest.timestamp}`,
    isSponsored: guest.isSponsored,
    contract: "Zora",
  }));

  // Find the most recent sponsored post from each data set
  const baseDataSponsored = baseDataFormatted?.filter(
    (item: { isSponsored: any }) => item.isSponsored
  );
  baseDataSponsored?.sort(
    (a: { timestamp: any }, b: { timestamp: any }) =>
      Number(b.timestamp) - Number(a.timestamp)
  );
  const baseDataMostRecentSponsored = baseDataSponsored?.shift();

  const zoraDataSponsored = zoraDataFormatted?.filter(
    (item: { isSponsored: any }) => item.isSponsored
  );
  zoraDataSponsored?.sort(
    (a: { timestamp: any }, b: { timestamp: any }) =>
      Number(b.timestamp) - Number(a.timestamp)
  );
  const zoraDataMostRecentSponsored = zoraDataSponsored?.shift();

  // Combine and sort the most recent sponsored posts
  const mostRecentSponsored = [
    baseDataMostRecentSponsored,
    zoraDataMostRecentSponsored,
  ].filter(Boolean);
  mostRecentSponsored.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  // Combine the remaining data
  const remainingData = [
    ...(baseDataFormatted?.filter(
      (item: any) => item !== baseDataMostRecentSponsored
    ) ?? []),
    ...(zoraDataFormatted?.filter(
      (item: any) => item !== zoraDataMostRecentSponsored
    ) ?? []),
  ];

  // Sort the remaining data by timestamp
  remainingData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  // Add the most recent sponsored posts at the start of the array
  const combinedData = [...mostRecentSponsored, ...remainingData];

  // isDev boolean
  const isDev = import.meta.env.DEV;
  return (
    <>
      {isDev && (
        <div className={`${styles.guestcount}`}>
          <p>{combinedData.length} happy guests</p>
        </div>
      )}

      {combinedData.map((guest: any, index) => (
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
            )}{" "}
            on {guest.contract}
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

              {index === 1 && (
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
