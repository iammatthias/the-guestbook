import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { useContractWrite } from "wagmi";
import { formatEther, parseEther } from "viem";

import styles from "./signTheGuestlist.module.css";

// Environment Variables and Constants
const CONTRACT = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const TARGET_CHAIN_ID = 84531;

export default function SignTheGuestlist() {
  const [text, setText] = useState("");
  const [isSponsored, setIsSponsored] = useState(false);
  const [price, setPrice] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const { data: currentMinPrice } = useContractRead({
    address: CONTRACT,
    chainId: TARGET_CHAIN_ID,
    functionName: "getCurrentMinPrice",
    watch: true,
    abi: [
      {
        inputs: [],
        name: "getCurrentMinPrice",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  });

  const newGuest = useContractWrite({
    address: CONTRACT,
    chainId: TARGET_CHAIN_ID,
    functionName: "signGuestbookNew",
    abi: [
      {
        inputs: [
          {
            internalType: "string",
            name: "message",
            type: "string",
          },
        ],
        name: "signGuestbookNew",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    onSuccess() {
      setText("");
      setIsLoading(false);
    },
    onError() {
      setIsLoading(false);
    },
  });

  const newSponsoredGuest = useContractWrite({
    address: CONTRACT,
    chainId: TARGET_CHAIN_ID,
    functionName: "sponsorMessage",
    abi: [
      {
        inputs: [
          {
            internalType: "string",
            name: "message",
            type: "string",
          },
        ],
        name: "sponsorMessage",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    args: ["message"],
    value: parseEther(price as any),
    onSuccess() {
      setText("");
      setIsLoading(false);
    },
    onError() {
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (isSponsored && currentMinPrice) {
      setPrice(formatEther(currentMinPrice));
    }
  }, [isSponsored, currentMinPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) {
      alert("Please enter a message.");
      return;
    }
    if (
      isSponsored &&
      parseFloat(price) < parseFloat(formatEther(currentMinPrice as bigint))
    ) {
      alert("Price must be equal to or greater than the minimum price.");
      return;
    }

    setIsLoading(true);
    if (isSponsored) {
      newSponsoredGuest?.write({ args: [text] });
    } else {
      newGuest?.write({ args: [text] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Your text...'
      />

      <label>
        Is Sponsored?{" "}
        <input
          type='checkbox'
          checked={isSponsored}
          onChange={(e) => setIsSponsored(e.target.checked)}
        />
      </label>

      {isSponsored && (
        <label className={`${styles.label__inline}`}>
          Minimum Price: {price} Ξ
          <input
            type='number'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
      )}
      <button type='submit'>Submit</button>
    </form>
  );
}
