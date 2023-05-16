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
              <Accordion.Trigger>Sign The Guestbook</Accordion.Trigger>
              <Accordion.Content>
                Sign the Guestbook by sending a message to the contract address.
                The message must be 140 characters or less. If you choose, you
                may sponsor a message to promote it to the top of the guestbook.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item className={`${styles.faq__item}`} value='item-2'>
              <Accordion.Trigger>Sponsored Messages</Accordion.Trigger>
              <Accordion.Content>
                A sponsored message will always carry a minimum price of `last
                price + 0.0001 Ξ`.
                <br />
                <br />
                The most recent sponsored message will be prominantly displayed
                until a new message is sponsored. If a message has not been
                sponsored for 21 days the price will slowly decrease until it
                reaches the original 0.0001 Ξ price point.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item className={`${styles.faq__item}`} value='item-3'>
              <Accordion.Trigger>Content Moderation</Accordion.Trigger>
              <Accordion.Content>
                Our team ensures a safe and welcoming space by monitoring and
                rewriting inappropriate content. When content moderation is
                required the message in question will be changed to `gm, hf`.
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
                The Guestbook is a place to share moments. There are no tokens,
                airdrops, or other gimmicks.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
