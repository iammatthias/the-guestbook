import * as Accordion from "@radix-ui/react-accordion";

import styles from "./faq.module.css";

const contract = import.meta.env.VITE_CONTRACT_BASE_GOERLI;
const blockExplorer = import.meta.env.VITE_BASESCAN;

export default function Faq() {
  return (
    <Accordion.Root type='single' className={`${styles.faq}`} collapsible>
      <Accordion.Item className={`${styles.faq__item}`} value='item-1'>
        <Accordion.Trigger>FAQ</Accordion.Trigger>
        <Accordion.Content>
          <Accordion.Root type='single' className={`${styles.faq}`} collapsible>
            <Accordion.Item className={`${styles.faq__item}`} value='item-1'>
              <Accordion.Trigger>Signing The Guestbook</Accordion.Trigger>
              <Accordion.Content>
                Connect your wallet to leave a message on the blockchain. Your
                message must be between 1 and 140 characters. Hateful or
                inflamatory content will be moderated.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item className={`${styles.faq__item}`} value='item-2'>
              <Accordion.Trigger>Content Moderation</Accordion.Trigger>
              <Accordion.Content>
                We ensure a safe and welcoming space by moderating content. When
                hateful or inflamatory is posted it will be rewritten to `gm,
                hf` at the contract owners discretion.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item className={`${styles.faq__item}`} value='item-3'>
              <Accordion.Trigger>Sponsored Messages</Accordion.Trigger>
              <Accordion.Content>
                Users may sponsor a message to be displayed prominantly at the
                top of the guestbook. Only one message can be sponsored at a
                time.
                <br />
                <br />
                The initial base price for a sponsored message is 0.0001 Ξ. Each
                new sponsored messaged will start at the last price + 0.0001 Ξ.
                <br />
                <br />
                If a message has not been sponsored for 21 days the price will
                slowly decrease until it reaches the original 0.0001 Ξ price
                point.
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item className={`${styles.faq__item}`} value='item-4'>
              <Accordion.Trigger>Guestbook Contract</Accordion.Trigger>
              <Accordion.Content>
                The Guestbook contract is verified on{" "}
                <a
                  href={`${blockExplorer}address/${contract}#code`}
                  target='_blank'
                  rel='noreferrer'>
                  Basescan
                </a>
                .
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item className={`${styles.faq__item}`} value='item-5'>
              <Accordion.Trigger>Utility</Accordion.Trigger>
              <Accordion.Content>
                There is none. Be safe, and have fun ✌️
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
