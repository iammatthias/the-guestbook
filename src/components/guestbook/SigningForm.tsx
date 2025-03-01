import { useState, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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

  // Reset form when transaction is successful
  useEffect(() => {
    if (isGmSuccess || isCustomSuccess) {
      // Reset form after successful transaction
      setCustomMessage("gm");
      setMintNFT(false);
      setError(null);
      setIsSubmitting(false);
      setShowSuccess(true);

      // Hide success message after a delay
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000); // 10 seconds

      // Notify parent component
      onSuccess();

      return () => clearTimeout(timer);
    }
  }, [isGmSuccess, isCustomSuccess, onSuccess]);

  const { mutate: signGuestbook, isPending: mutationLoading } = useMutation({
    mutationFn: async () => {
      if (isPaused) {
        setError("The guestbook is currently paused. Please try again later.");
        return;
      }

      try {
        // Calculate the correct value to send
        let value = 0n;

        // Add fee for custom message (not "gm")
        if (customMessage.toLowerCase() !== "gm") {
          value += parseEther("0.00111");
        }

        // Add fee for NFT minting
        if (mintNFT) {
          value += parseEther("0.00111");
        }

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
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      // Note: We're now handling the form reset in the useEffect above
      // to ensure it happens after the transaction is confirmed
    },
    onError: (error: unknown) => {
      console.error("Error signing guestbook:", error);
      setError(getErrorMessage(error));
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    try {
      setIsSubmitting(true);
      await signGuestbook();
    } catch (error) {
      console.error("Error submitting:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.form}>
      <h3 className='flex-center'>✦ SIGN THE GUESTBOOK ✦</h3>
      <div className='pixel-divider'></div>

      <div className={styles.messageTypeSelector}>
        <label className={`${styles.messageType} ${customMessage.toLowerCase() === "gm" ? styles.active : ""}`}>
          <input
            type='radio'
            checked={customMessage.toLowerCase() === "gm"}
            onChange={() => {
              setCustomMessage("gm");
              setError(null);
            }}
            disabled={isLoading || mutationLoading || isSubmitting}
          />
          <span style={{ fontWeight: "bold" }}>» "gm"</span>
        </label>
        <label className={`${styles.messageType} ${customMessage.toLowerCase() !== "gm" ? styles.active : ""}`}>
          <input
            type='radio'
            checked={customMessage.toLowerCase() !== "gm"}
            onChange={() => {
              setCustomMessage("");
              setError(null);
            }}
            disabled={isLoading || mutationLoading || isSubmitting}
          />
          <span style={{ fontWeight: "bold" }}>✎ Custom</span>
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
            disabled={isLoading || mutationLoading || isSubmitting}
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
          disabled={isLoading || mutationLoading || isSubmitting}
        />
        <span style={{ fontWeight: "bold" }}>◈ Mint onchain (+0.00111 Ξ)</span>
      </label>

      <div className='flex-col'>
        <div className='pixel-divider'></div>
        <h4 className='flex-center'>$ PRICE BREAKDOWN $</h4>
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
        <div className='pixel-divider'></div>
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            Boolean(isPaused) ||
            isSubmitting ||
            mutationLoading ||
            (customMessage.toLowerCase() !== "gm" && (!customMessage.trim() || customMessage.length > 140))
          }
        >
          {isSubmitting || mutationLoading || isLoading ? "⌛ SIGNING..." : "✍ SIGN THE GUESTBOOK"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {showSuccess && (
        <div className={styles.success}>
          ★ You signed the guestbook! It will appear below in a few seconds.
          {mintNFT && " Your NFT is being minted. ◈"}
        </div>
      )}
    </div>
  );
}
