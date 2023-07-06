import { useState, useEffect } from "react";
import { useContractWrite, useContractRead, useNetwork } from "wagmi";
import { formatEther, parseEther } from "viem";
import { mainnet, baseGoerli, zoraTestnet } from "wagmi/chains";
import styles from "./signTheGuestlist.module.css";

// Environment Variables and Constants
const BASE_CONTRACT = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const ZORA_CONTRACT = import.meta.env.VITE_CONTRACT_ZORA_GOERLI;

export default function SignTheGuestlist() {
  const { chain } = useNetwork();

  const [text, setText] = useState("");
  const [isSponsored, setIsSponsored] = useState(false);
  const [price, setPrice] = useState("0");
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  const useContract = (
    functionName: string,
    stateMutability: string,
    args: { internalType: string; name: string; type: string }[],
    value: string | undefined,
    isSponsored: boolean | undefined
  ) => {
    const { chain } = useNetwork();

    // Determine the appropriate contract and chain ID for the write operation.
    const contractAddress =
      chain?.id === baseGoerli.id ? BASE_CONTRACT : ZORA_CONTRACT;
    const contractChainId =
      chain?.id === baseGoerli.id ? baseGoerli.id : zoraTestnet.id;
    const etherValue = isSponsored ? parseEther(value as any) : parseEther("0");

    // Prepare the ABI for the function to call.
    const abi = [
      {
        inputs: args,
        name: functionName,
        outputs: [],
        stateMutability,
        type: "function",
      },
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
    ];

    const { write } = useContractWrite({
      address: contractAddress,
      chainId: contractChainId,
      functionName,
      value: etherValue,
      abi,
    });

    const { data: currentMinPrice } = useContractRead({
      address: contractAddress,
      abi, // you need to have a separate ABI for the `getCurrentMinPrice` function
      functionName: "getCurrentMinPrice", // replace with actual function name in your contract
    });

    return { write, currentMinPrice };
  };

  const { write: newGuest } = useContract(
    "signGuestbookNew",
    "nonpayable",
    [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    "0",
    false
  );

  const { write: newSponsoredGuest, currentMinPrice } = useContract(
    "sponsorMessage",
    "payable",
    [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    price,
    isSponsored
  );

  console.log(currentMinPrice);

  useEffect(() => {
    if (isSponsored && currentMinPrice) {
      setPrice(formatEther(currentMinPrice as any));
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
      parseFloat(price) < parseFloat(formatEther(currentMinPrice as any))
    ) {
      alert("Price must be equal to or greater than the minimum price.");
      return;
    }

    if (isSponsored) {
      newSponsoredGuest({ args: [text] });
    } else {
      newGuest({ args: [text] });
    }
  };

  useEffect(() => {
    setIsFormDisabled(
      !(chain?.id === baseGoerli.id || chain?.id === zoraTestnet.id)
    );
  }, [chain]);

  return (
    <form onSubmit={handleSubmit} className={`${styles.form}`}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='gm, hf'
      />

      {chain?.id === mainnet.id && (
        <div className='alert'>
          <p>Connect to Base or Zora (testnet) to sign the guestbook</p>
        </div>
      )}

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

      <button type='submit' disabled={isFormDisabled}>
        {isFormDisabled
          ? "Waiting to connect to Base or Zora (testnet)"
          : `Submit on ${chain?.name}`}
      </button>
    </form>
  );
}
