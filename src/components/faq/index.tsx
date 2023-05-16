import * as Accordion from "@radix-ui/react-accordion";
import HTMLReactParser from "html-react-parser";

import styles from "./faq.module.css";

const contract = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const blockExplorer = import.meta.env.VITE_BASESCAN;
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
      "We ensure a safe and welcoming space by moderating content. When hateful or inflamatory is posted it will be rewritten to `gm, hf` at the contract owners discretion.",
  },
  {
    question: "Sponsored Messages",
    answer:
      "Users may sponsor a message to be displayed prominantly at the top of the guestbook. Only one message can be sponsored at a time.<br/><br/>The initial base price for a sponsored message is 0.0001 Ξ. Each new sponsored messaged starts at the last price + 0.0001 Ξ.<br/><br/>If a message has not been sponsored for 21 days the price will slowly decrease until it reaches the original 0.0001 Ξ price point.",
  },
  {
    question: "Guestbook Contract",
    answer: `The Guestbook contract is verified on <a href="${blockExplorer}address/${contract}#code" target="_blank" rel="noreferrer">Basescan</a>.`,
  },
  {
    question: "Utility",
    answer: "There is none. Be safe, and have fun ✌️",
  },
];

export default function Faq() {
  return (
    <>
      <Accordion.Root type='single' className={faqClass} collapsible>
        <Accordion.Item
          className={faqItemClass}
          value={`item-faq`}
          key={`item-faq`}>
          <Accordion.Trigger>FAQ</Accordion.Trigger>
          <Accordion.Content>
            <Accordion.Root type='single' className={faqClass} collapsible>
              {FAQs.map((faq, index) => (
                <Accordion.Item
                  className={faqItemClass}
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
