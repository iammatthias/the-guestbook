import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import styles from "./Guestbook.module.css";
import { contractAddress, guestbookABI } from "./constants";
import { getErrorMessage, sanitizeMessage } from "./utils";
import { useMutation } from "@tanstack/react-query";

interface SigningFormProps {
  isPaused: boolean | undefined;
  onSuccess: () => void;
}

export function SigningForm({ isPaused, onSuccess }: SigningFormProps) {
  const [customMessage, setCustomMessage] = useState<string>("gm");
  const [mintNFT, setMintNFT] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Contract writes
  const { writeContract: writeGm, isPending: isGmPending, data: gmHash } = useWriteContract();
  const { writeContract: writeCustom, isPending: isCustomPending, data: customHash } = useWriteContract();

  // Transaction status
  const { isLoading: isGmConfirming, isSuccess: isGmSuccess } = useWaitForTransactionReceipt({
    hash: gmHash,
    chainId: baseSepolia.id,
  });

  const { isLoading: isCustomConfirming, isSuccess: isCustomSuccess } = useWaitForTransactionReceipt({
    hash: customHash,
    chainId: baseSepolia.id,
  });

  const isLoading = isGmPending || isCustomPending || isGmConfirming || isCustomConfirming;

  const { mutate: signGuestbook, isPending: mutationLoading } = useMutation({
    mutationFn: async () => {
      if (isPaused) {
        setError("The guestbook is currently paused. Please try again later.");
        return;
      }

      try {
        const value = mintNFT ? parseEther("0.00111") : 0n;
        if (customMessage.toLowerCase() === "gm") {
          writeGm({
            address: contractAddress,
            abi: guestbookABI,
            functionName: "signGuestbookGm",
            args: [mintNFT],
            value,
            chainId: baseSepolia.id,
          });
        } else {
          const sanitized = sanitizeMessage(customMessage);
          if (!sanitized) {
            setError("Please enter a valid message");
            return;
          }
          if (sanitized.length > 140) {
            setError("Message must be 140 characters or less");
            return;
          }
          writeCustom({
            address: contractAddress,
            abi: guestbookABI,
            functionName: "signGuestbookCustom",
            args: [sanitized, mintNFT],
            value,
            chainId: baseSepolia.id,
          });
        }
      } catch (err) {
        console.error("Error signing guestbook:", err);
        setError(getErrorMessage(err));
      }
    },
    onSuccess: () => {
      setError(null);
      setCustomMessage("gm");
      setMintNFT(false);
      onSuccess();
    },
    onError: (error: unknown) => {
      console.error("Error signing guestbook:", error);
      setError(getErrorMessage(error));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    try {
      await signGuestbook();
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.messageTypeSelector}>
        <label className={`${styles.messageType} ${customMessage.toLowerCase() === "gm" ? styles.active : ""}`}>
          <input
            type='radio'
            checked={customMessage.toLowerCase() === "gm"}
            onChange={() => {
              setCustomMessage("gm");
              setError(null);
            }}
            disabled={isLoading || mutationLoading}
          />
          "gm""
        </label>
        <label className={`${styles.messageType} ${customMessage.toLowerCase() !== "gm" ? styles.active : ""}`}>
          <input
            type='radio'
            checked={customMessage.toLowerCase() !== "gm"}
            onChange={() => {
              setCustomMessage("");
              setError(null);
            }}
            disabled={isLoading || mutationLoading}
          />
          Custom
        </label>
      </div>

      {customMessage.toLowerCase() !== "gm" && (
        <div className={styles.flexCol}>
          <textarea
            className='input-full'
            value={customMessage}
            onChange={(e) => {
              const sanitized = sanitizeMessage(e.target.value);
              setCustomMessage(sanitized);
              setError(null);
            }}
            placeholder='Your message (max 140 characters)'
            maxLength={140}
            disabled={isLoading || mutationLoading}
            rows={3}
          />
          <span className={customMessage.length > 140 ? styles.error : ""}>
            {140 - customMessage.length} characters remaining
          </span>
        </div>
      )}

      <label className={styles.nftOption}>
        <input
          type='checkbox'
          checked={mintNFT}
          onChange={(e) => setMintNFT(e.target.checked)}
          disabled={isLoading || mutationLoading}
        />
        <span>Mint onchain (+0.00111 Ξ)</span>
      </label>

      <div className='flex-col'>
        <div className={styles.priceBreakdown}>
          <span>Message fee:</span>
          <span>{customMessage.toLowerCase() === "gm" ? "No contract fee" : "0.00111 Ξ"}</span>
        </div>
        {mintNFT && (
          <div className={styles.priceBreakdown}>
            <span>NFT fee:</span>
            <span>0.00111 Ξ</span>
          </div>
        )}
        <div className={`${styles.priceBreakdown} ${styles.total}`}>
          <span>Total contract fees:</span>
          <span>
            {customMessage.toLowerCase() === "gm" ? (mintNFT ? "0.00111" : "0") : mintNFT ? "0.00222" : "0.00111"} Ξ
          </span>
        </div>
        <div className={styles.priceBreakdown}>
          <span>Gas fees:</span>
          <span>Variable (paid to network)</span>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            Boolean(isPaused) ||
            (customMessage.toLowerCase() !== "gm" && (!customMessage.trim() || customMessage.length > 140))
          }
        >
          {mutationLoading ? "Signing..." : "Sign the Guestbook"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {(isGmSuccess || isCustomSuccess) && (
        <div className={styles.success}>
          You signed the guestbook! It will appear below in a few seconds.
          {mintNFT && " Your NFT is being minted."}
        </div>
      )}
    </div>
  );
}
