// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./StringUtils.sol";

contract TheGuestbook is Ownable {
    /* ⌐◨— DATA —◨ */
    // Guestbook contains the metadata for the guestbook.
    // guest: Address of the guest.
    // message: The message left by the guest.
    // timestamp: The time at which the guestbook was signed.
    // isSponsored: Indicates whether the entry is a sponsored message.
    struct Guestbook {
        address guest;
        string message;
        uint256 timestamp;
        bool isSponsored;
    }

    uint256 private guestCount;
    mapping(uint256 => Guestbook) public guestbook;

    uint256 public sponsoredMessageMinPrice;
    uint256 public lastSponsoredMessageUpdate;
    uint256 public dutchAuctionPeriod;
    uint256 public originalMinPrice;

    /* ⌐◨— EVENTS —◨ */

    // Emitted when the contract is deployed
    event Gm();

    // Emitted when a guest signs the guestbook
    event GuestbookSigned(address indexed guest, string message, uint256 timestamp, bool isSponsored);

    // Emitted when we know that something about the guest has changed
    event GuestbookUpdated(address indexed guest, string message);

    // Emitted when a guestbook message is rewritten
    event GuestbookMessageRewritten(string message);

    // Emitted when an empty message error occurs
    event EmptyMessageError(address indexed guest);

    // Emitted when a message is too long
    event MessageTooLongError(address indexed guest);

    /* ⌐◨— PUBLIC —◨ */

    // @dev Creates a new regular guestbook entry
    // @param message The message left by the guest
    function signGuestbookNew(string memory message) public {
        _createNewGuestbookEntry(message, false);
    }

    // @dev Sponsors a message with the dutch auction pricing mechanism
    // @param message The message to be sponsored
    function sponsorMessage(string memory message) public payable {
        uint256 currentMinPrice = getCurrentMinPrice();

        require(msg.value >= currentMinPrice, "Price below current minimum");
        require(bytes(message).length != 0, "EmptyMessage");
        require(bytes(message).length <= 140, "MessageTooLong");

        _createNewGuestbookEntry(message, true);

        lastSponsoredMessageUpdate = block.timestamp;
        sponsoredMessageMinPrice = msg.value + 100000000000000;
    }

    // @dev Updates a guestbook entry
    // @param guestId The ID of the guest
    // @param message The message left by the guest
    function updateGuestbook(uint256 guestId, string memory message) public {
        require(msg.sender == guestbook[guestId].guest || msg.sender == owner(), "Unauthorized");
        require(bytes(message).length != 0, "EmptyMessage");
        require(bytes(message).length <= 140, "MessageTooLong");

        string memory encodedMessage = StringUtils.toHexString(bytes(message));

        guestbook[guestId].message = encodedMessage;
        emit GuestbookUpdated(guestbook[guestId].guest, encodedMessage);
    }

    /* ⌐◨— ADMIN —◨ */

    // @dev Withdraws all funds from the contract
    function withdrawAll() external onlyOwner {
        Address.sendValue(payable(owner()), address(this).balance);
    }

    // @dev Withdraws all ERC20 tokens from the contract
    // @param _erc20Token The ERC20 token to be withdrawn
    function withdrawAllERC20(IERC20Metadata _erc20Token) external onlyOwner {
        SafeERC20.safeTransfer(_erc20Token, owner(), _erc20Token.balanceOf(address(this)));
    }

    // @dev Rewrites a guestbook message if it is hateful or inflammatory
    // @param guestId The ID of the guest
    function rewriteMessage(uint256 guestId) public onlyOwner {
        guestbook[guestId].message = "676d2c206866";
        emit GuestbookMessageRewritten(guestbook[guestId].message);
    }

    /* ⌐◨— HELPERS —◨ */

    // @dev Creates a new guestbook entry, either regular or sponsored
    // @param message The message left by the guest
    // @param isSponsored Indicates whether the entry is a sponsored message
    function _createNewGuestbookEntry(string memory message, bool isSponsored) private {
        if (bytes(message).length == 0) {
            emit EmptyMessageError(msg.sender);
            return;
        }
        if (bytes(message).length > 140) {
            emit MessageTooLongError(msg.sender);
            return;
        }

        string memory encodedMessage = StringUtils.toHexString(bytes(message));

        guestCount++;
        guestbook[guestCount] = Guestbook(msg.sender, encodedMessage, block.timestamp, isSponsored);
        emit GuestbookSigned(msg.sender, encodedMessage, block.timestamp, isSponsored);
    }

    // @dev Returns all guestbook entries, including sponsored messages
    // @return An array of all Guestbook structs
    function getAllGuests() public view returns (Guestbook[] memory) {
        Guestbook[] memory allGuests = new Guestbook[](guestCount + 1);

        for (uint256 i = 0; i <= guestCount; i++) {
            Guestbook storage currentGuest = guestbook[i];
            allGuests[i] = Guestbook(currentGuest.guest, currentGuest.message, currentGuest.timestamp, currentGuest.isSponsored);
        }

        return allGuests;
    }

    // @dev Returns the current minimum price for sponsored messages based on the dutch auction mechanism
    // @return The current minimum price for sponsored messages
    function getCurrentMinPrice() public view returns (uint256) {
        uint256 timeSinceLastUpdate = block.timestamp - lastSponsoredMessageUpdate;

        if (timeSinceLastUpdate < dutchAuctionPeriod) {
            return sponsoredMessageMinPrice;
        } else {
            uint256 elapsedAuctionTime = timeSinceLastUpdate - dutchAuctionPeriod;
            uint256 priceDecrease = (sponsoredMessageMinPrice - originalMinPrice) * elapsedAuctionTime / dutchAuctionPeriod;
            return sponsoredMessageMinPrice - priceDecrease;
        }
    }

    // @dev Updates the sponsored message parameters
    // @param _sponsoredMessageMinPrice The new minimum price for sponsored messages
    // @param _dutchAuctionPeriod The new dutch auction period
    function updateSponsoredMessageParameters(uint256 _sponsoredMessageMinPrice,  uint256 _dutchAuctionPeriod) external onlyOwner {
        sponsoredMessageMinPrice = _sponsoredMessageMinPrice;
        dutchAuctionPeriod = _dutchAuctionPeriod;
    }

    // @dev Updates the sponsored message minimum price
    // @param _sponsoredMessageMinPrice The new minimum price for sponsored messages
    function updateSponsoredMessageMinPrice(uint256 _sponsoredMessageMinPrice) external onlyOwner {
        sponsoredMessageMinPrice = _sponsoredMessageMinPrice;
    }

    
    // @dev Updates the dutch auction period
    // @param _dutchAuctionPeriod The new dutch auction period
    function updateDutchAuctionPeriod(uint256 _dutchAuctionPeriod) external onlyOwner {
        dutchAuctionPeriod = _dutchAuctionPeriod;
    }

    /* ⌐◨— CONSTRUCTOR —◨ */
    constructor() Ownable() {
        sponsoredMessageMinPrice = 100000000000000; // 0.0001 ETH
        originalMinPrice = 100000000000000; // 0.0001 ETH
        dutchAuctionPeriod = 21 days;

        guestbook[0] = Guestbook(msg.sender, "676d2c206866", block.timestamp, true);
        lastSponsoredMessageUpdate = block.timestamp;
        emit Gm();
    }
}