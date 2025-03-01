// ABI and contract address moved here
export const contractAddress = "0xe2f03B67d2785cd7C392992eB7f06395fAC7fb34" as const;

// Full ABI with all required functions and events
export const guestbookABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        internalType: "string",
        name: "sanitizedMessage",
        type: "string",
      },
      {
        internalType: "string",
        name: "formattedDate",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Add paused function
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Add signGuestbookGm function
  {
    inputs: [
      {
        internalType: "bool",
        name: "mintNFT",
        type: "bool",
      },
    ],
    name: "signGuestbookGm",
    outputs: [
      {
        internalType: "uint256",
        name: "guestId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  // Add signGuestbookCustom function
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        internalType: "bool",
        name: "mintNFT",
        type: "bool",
      },
    ],
    name: "signGuestbookCustom",
    outputs: [
      {
        internalType: "uint256",
        name: "guestId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  // Add GuestbookSigned event
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "guestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "guest",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "GuestbookSigned",
    type: "event",
  },
] as const;
