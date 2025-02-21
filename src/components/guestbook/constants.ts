// ABI and contract address moved here
export const contractAddress = "0x7327468bf87Bed17Ffb2946d460810051eF43C35" as const;

export const guestbookABI = [
  {
    inputs: [],
    name: "getGuestCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "mintNFT", type: "bool" }],
    name: "signGuestbookGm",
    outputs: [
      { internalType: "uint256", name: "guestId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "message", type: "string" },
      { internalType: "bool", name: "mintNFT", type: "bool" },
    ],
    name: "signGuestbookCustom",
    outputs: [
      { internalType: "uint256", name: "guestId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    type: "event",
    name: "GuestbookSigned",
    inputs: [
      { indexed: true, internalType: "uint256", name: "guestId", type: "uint256" },
      { indexed: true, internalType: "address", name: "guest", type: "address" },
      { indexed: false, internalType: "string", name: "message", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
  },
] as const;
