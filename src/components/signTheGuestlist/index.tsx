import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { useContractWrite } from "wagmi";
import { formatEther, parseEther } from "viem";

import styles from "./signTheGuestlist.module.css";

export default function SignTheGuestlist() {
  const [text, setText] = useState("");
  const [isSponsored, setIsSponsored] = useState(false);
  const [price, setPrice] = useState("0");
  const [minPrice, setMinPrice] = useState("0");

  const { data: currentMinPrice } = useContractRead({
    address: import.meta.env.VITE_CONTRACT,
    chainId: 11155111,
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
    address: import.meta.env.VITE_CONTRACT,
    chainId: 11155111,
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
    },
  });

  const newSponsoredGuest = useContractWrite({
    address: import.meta.env.VITE_CONTRACT,
    chainId: 11155111,
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
    },
  });

  // Get current minimum price on component mount and whenever isSponsored changes
  useEffect(() => {
    if (isSponsored) {
      setMinPrice(formatEther(currentMinPrice as bigint));
      setPrice(formatEther(currentMinPrice as bigint));
    }
  }, [isSponsored, currentMinPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        Is Sponsored:
        <input
          type='checkbox'
          checked={isSponsored}
          onChange={(e) => setIsSponsored(e.target.checked)}
        />
      </label>

      {isSponsored && (
        <label className={`${styles.label__inline}`}>
          Minimum Price: {minPrice} Ξ
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
