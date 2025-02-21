# TheGuestbook

An onchain guestbook, soon on Base.

There are a few flavors of this project floating around, the idea isn't unique. But this one is mine! It has a few fun features that I think set it apart.

I originally launched this on Base-Goerli. Unfortunately, the project died when Goerli was sunset. After some testing on Base-Sepolia, we're moving to Base-mainnet.

1. It's on Base.
2. Users can leave a simple `gm` for free (plus gas)
3. Users can leave a custom message for a small fee (plus gas)
4. Users can mint an NFT of their message for an additional fee (plus gas)
5. The NFT is a fully onchain SVG
6. It has a moderation function to remove harmful content
7. It has some simple onchain sanitization for malicious content

## Frontend

The frontend is a simple Vite + React app and is hosted on [Orbiter](https://orbiter.host/).

## Contract

Find the smart contract at `0x38484087434cc1cAA2925943F5a59c4B33667749` on Base-Sepolia. The contract code lives in `/contracts` if you want to take a look.

---

Made with Vite + React. Based on Base.
