import * as Accordion from "@radix-ui/react-accordion";
import HTMLReactParser from "html-react-parser";

import styles from "./faq.module.css";

const BASE_CONTRACT = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const ZORA_CONTRACT = import.meta.env.VITE_CONTRACT_ZORA_GOERLI;
const BASE_BLOCKEXPLORER = import.meta.env.VITE_BASESCAN;
const ZORA_BLOCKEXPLORER = import.meta.env.VITE_BLOCKSCOUT;
const faqClass = `${styles.faq}`;
const faqItemClass = `${styles.faq__item}`;

const FAQs = [
  {
    question: "Signing The Guestbook",
    answer:
      "Connect your wallet to leave a message on the blockchain. Your message must be between 1 and 140 characters. Hateful or inflammatory content will be moderated.",
  },
  {
    question: "Content Moderation",
    answer:
      "We ensure a safe and welcoming space by moderating content. Hateful or inflamatory may be rewritten to `gm, hf` at the contract owners discretion.",
  },
  {
    question: "Sponsored Messages",
    answer:
      "Users may sponsor a message to have it displayed at the top of the guestbook. Only one message can be sponsored at a time on each chain.<br/><br/>The base price for a sponsored message is 0.0001 Ξ on each chain. Each new sponsored messaged starts at the last price + 0.0001 Ξ.<br/><br/>If a message has not been sponsored for 21 days the price will slowly decrease until it reaches the original 0.0001 Ξ price point.",
  },
  {
    question: "Open Source",
    answer: `The Guestbook is verified on <a href="${BASE_BLOCKEXPLORER}address/${BASE_CONTRACT}#code" target="_blank" rel="noreferrer" alt="Link to view the contract on Basescan">Basescan</a> and <a href="${ZORA_BLOCKEXPLORER}address/${ZORA_CONTRACT}#code" target="_blank" rel="noreferrer" alt="Link to view the contract on Blockscout (Zora testnet)">Blockscout (Zora testnet)</a>, and is available on <a href="https://github.com/iammatthias/the-guestbook/tree/main" target="_blank" rel="noreferrer" alt="Link to view the source code on Github">Github</a>.<br/><br/>Built with <a href="https://vitejs.dev/">ViteJS</a>, <a href="https://wagmi.sh/">Wagmi</a>, <a href="https://viem.sh">Viem</a>, and <a href="https://www.rainbowkit.com/">RainbowKit</a>.`,
  },
  {
    question: "Utility",
    answer: "There is no utility. Be safe, and have fun ✌️",
  },
];

export default function Faq() {
  return (
    <>
      <Accordion.Root type='single' className={styles.faq} collapsible>
        <Accordion.Item
          className={styles.faq__item}
          value={`item-faq`}
          key={`item-faq`}>
          <Accordion.Trigger>FAQ</Accordion.Trigger>
          <Accordion.Content>
            <Accordion.Root type='single' className={styles.faq} collapsible>
              {FAQs.map((faq, index) => (
                <Accordion.Item
                  className={styles.faq__item}
                  value={`item-${index + 1}`}
                  key={`item-${index + 1}`}>
                  <Accordion.Trigger>{faq.question}</Accordion.Trigger>
                  <Accordion.Content>
                    {HTMLReactParser(faq.answer)}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </>
  );
}
