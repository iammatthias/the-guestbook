export interface GuestbookEvent {
  guestId: bigint;
  guest: `0x${string}`;
  message: string;
  timestamp: bigint;
  tokenId: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface AddressDisplayProps {
  address: `0x${string}`;
}
