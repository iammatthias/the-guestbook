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
  });

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
  });

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

  const combinedData = [
    ...(baseDataFormatted ?? []),
    ...(zoraDataFormatted ?? []),
  ];

  // Sort the data by timestamp
  combinedData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  // Find the index of the first sponsored post from each contract
  const baseSponsoredIndex = combinedData.findIndex(
    (item) => item.isSponsored && item.contract === "Base"
  );
  const zoraSponsoredIndex = combinedData.findIndex(
    (item) => item.isSponsored && item.contract === "Zora"
  );

  let sponsoredPosts = [];

  // Move the first sponsored post from each contract to the start of the array
  if (baseSponsoredIndex > -1) {
    const baseSponsoredPost = combinedData.splice(baseSponsoredIndex, 1)[0];
    sponsoredPosts.push(baseSponsoredPost);
  }
  if (zoraSponsoredIndex > -1) {
    const zoraSponsoredPost = combinedData.splice(zoraSponsoredIndex, 1)[0];
    sponsoredPosts.push(zoraSponsoredPost);
  }

  sponsoredPosts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const recombinedData = [...sponsoredPosts, ...combinedData];

  // isDev boolean
  const isDev = import.meta.env.DEV;
  return (
    <>
      {isDev && (
        <div className={`${styles.guestcount}`}>
          <p>{recombinedData.length} happy guests</p>
        </div>
      )}

      {recombinedData.map((guest: any, index) => (
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
