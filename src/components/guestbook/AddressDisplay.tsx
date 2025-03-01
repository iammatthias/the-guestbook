import styles from "./Guestbook.module.css";
import { AddressDisplayProps } from "./types";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";

export function AddressDisplay({ address }: AddressDisplayProps) {
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: mainnet.id, // Explicitly use Ethereum mainnet for ENS resolution
  });

  // Format address for display (truncate if no ENS)
  const formatAddress = (addr: string): string => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const displayText = ensName || formatAddress(address);

  if (isLoading) {
    // Show truncated address while loading
    return <span className={styles.addressLink}>{formatAddress(address)}</span>;
  }

  return (
    <a
      href={`https://sepolia.basescan.org/address/${address}`}
      target='_blank'
      rel='noopener noreferrer'
      className={styles.addressLink}
      title={address}
    >
      {displayText}
    </a>
  );
}
