import { useEnsName } from "wagmi";
import styles from "./Guestbook.module.css";
import { AddressDisplayProps } from "./types";

export function AddressDisplay({ address }: AddressDisplayProps) {
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: 1, // Use mainnet for ENS resolution
  });

  if (isLoading) {
    return <span className={styles.addressLink}>{address}</span>;
  }

  return (
    <a
      href={`https://sepolia.basescan.org/address/${address}`}
      target='_blank'
      rel='noopener noreferrer'
      className={styles.addressLink}
    >
      {ensName || address}
    </a>
  );
}
