# TheGuestbook

TheGuestbook is a decentralized guestbook application built on the Ethereum blockchain. Users can sign the guestbook, leave messages, and even sponsor messages through a Dutch auction pricing mechanism. The smart contract allows for easy maintenance and updating of guestbook entries while ensuring the integrity and permanence of the data stored.

## Features

- Sign the guestbook with a personal message
- Sponsor a message to stand out from the crowd
- Update your guestbook entry through the contract on Etherscan
- VRDA pricing mechanism for sponsored messages
- Admin features to maintain a clean and welcoming guestbook

## Smart Contract

### Functions

1. `signGuestbookNew(string memory message)`: Sign the guestbook with a new message.
2. `sponsorMessage(string memory message)`: Sponsor a message with the Dutch auction pricing mechanism.
3. `updateGuestbook(uint256 guestId, string memory message)`: Update an existing guestbook entry.
4. `withdrawAll()`: Withdraw all Ether from the contract (admin only).
5. `withdrawAllERC20(IERC20Metadata _erc20Token)`: Withdraw all ERC20 tokens from the contract (admin only).
6. `rewriteMessage(uint256 guestId)`: Rewrite a guestbook message if it is hateful or inflammatory (admin only).
7. `getAllGuests()`: Get all guestbook entries, including sponsored messages.
8. `getCurrentMinPrice()`: Get the current minimum price for sponsored messages based on the Dutch auction mechanism.
9. `updateSponsoredMessageParameters(uint256 _sponsoredMessageMinPrice, uint256 _dutchAuctionPeriod)`: Update the sponsored message parameters (admin only).
10. `updateSponsoredMessageMinPrice(uint256 _sponsoredMessageMinPrice)`: Update the sponsored message minimum price (admin only).
11. `updateDutchAuctionPeriod(uint256 _dutchAuctionPeriod)`: Update the Dutch auction period (admin only).

### Events

1. `Gm`: Emitted when the contract is deployed.
2. `GuestbookSigned`: Emitted when a guest signs the guestbook.
3. `GuestbookUpdated`: Emitted when a guestbook entry is updated.
4. `GuestbookMessageRewritten`: Emitted when a guestbook message is rewritten by an admin.
5. `EmptyMessageError`: Emitted when an empty message error occurs.
6. `MessageTooLongError`: Emitted when a message is too long.

## How to use

1. Connect your Ethereum wallet (such as MetaMask) to the application.
2. Choose whether you want to sign the guestbook with a regular or sponsored message.
3. Enter your message and click "Sign the Guestbook".
4. If you want to sponsor a message, enter your message and the amount you want to pay, then click "Sponsor Message".
5. Browse and filter guestbook entries to see what others have written.
6. Admins can use the admin panel to rewrite messages, withdraw funds, and update contract parameters.
