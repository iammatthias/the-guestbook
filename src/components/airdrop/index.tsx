import React, { useEffect, useState } from "react";
import Sparkles from "react-sparkle";
import styles from "./airdrop.module.css";

import {
  useNetwork,
  useSwitchNetwork,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { parseEther } from "viem";

export default function Airdrop() {
  const { chain } = useNetwork();
  const { switchNetworkAsync, isLoading: isSwitching } = useSwitchNetwork();

  const { data, isLoading, isSuccess, isError, sendTransaction } =
    useSendTransaction({
      chainId: 1,
      to: "0x429f42fB5247e3a34D88D978b7491d4b2BEe6105",
      value: parseEther("0.05"),
    });

  const waitForTransaction = useWaitForTransaction({
    hash: data?.hash,
  });

  const [buttonPressed, setButtonPressed] = useState(false);
  const [originalChainId, setOriginalChainId] = useState<number | undefined>(
    undefined
  );

  const handleDonate = async () => {
    setButtonPressed(true);
    // Store original chainId before switching
    setOriginalChainId(chain?.id);

    if (chain?.id !== 1) {
      if (switchNetworkAsync) {
        await switchNetworkAsync(1);
      }
    }
  };

  useEffect(() => {
    // Send the transaction automatically once the network switch is successful and button has been pressed
    if (chain?.id === 1 && buttonPressed) {
      sendTransaction && sendTransaction();
    }
  }, [chain, sendTransaction, buttonPressed]);

  useEffect(() => {
    // After the transaction, switch back to the original chain
    if ((isSuccess || isError) && originalChainId && switchNetworkAsync) {
      switchNetworkAsync(originalChainId);
      setButtonPressed(false); // Reset button press state
    }
  }, [isSuccess, isError, originalChainId, switchNetworkAsync]);

  return (
    <div className={styles.airdrop}>
      <h4>Airdrop</h4>
      <p>Are you here for an Airdrop?</p>
      <p>
        Donate 0.05 Ξ to support development of The Guestbook & other projects
        for{" "}
        <b>
          <i>a chance</i>
        </b>{" "}
        to be eligable in the future.
      </p>
      <button
        disabled={isSwitching || !chain || !sendTransaction}
        onClick={handleDonate}>
        {isSwitching ? "Switching network..." : "Donate 0.05 Ξ on Mainnet"}
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      <Sparkles
        color='#DAA520'
        count={20}
        minSize={7}
        maxSize={12}
        overflowPx={8}
        fadeOutSpeed={30}
        flicker={false}
      />
    </div>
  );
}
