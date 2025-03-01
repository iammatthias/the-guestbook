// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Utils.sol";
import "./SVGRenderer.sol";

/**
 * @notice Interface for external NFT renderer.
 */
interface IRenderer {
    function tokenURI(
        uint256 tokenId,
        address author,
        string calldata sanitizedMessage,
        string calldata formattedDate,
        uint256 blockNumber
    ) external view returns (string memory);
}

/**
 * @title TheGuestbook
 * @notice Implements an on-chain guestbook with signing options that can mint an NFT.
 */
contract TheGuestbook is Ownable, ERC721, ReentrancyGuard {
    // Pack booleans with uint256 values where possible for storage efficiency
    bool private _paused;
    uint256 private _guestCount;
    uint256 private _tokenIdCounter;
    string private _gmMessage;

    /// @notice External renderer for NFT onchain SVG.
    address public renderer;

    /// @notice Fee for signing with a custom message.
    uint256 public constant CUSTOM_MSG_FEE = 0.00111 ether;
    /// @notice Fee for minting an NFT.
    uint256 public constant NFT_FEE = 0.00111 ether;

    /**
     * @notice Structure to store NFT mint data.
     */
    struct NFTData {
        address author;
        string message;
        uint256 timestamp;
        uint256 blockNumber;
    }

    /// @notice Mapping from token ID to NFT data.
    mapping(uint256 => NFTData) public nftData;

    /// @notice Mapping from guest ID to token ID (if an NFT was minted for that guest entry).
    mapping(uint256 => uint256) private _guestToToken;
    
    /// @notice Mapping to track rewritten messages
    mapping(uint256 => bool) private _rewrittenMessages;

    /* ERRORS */
    error EmptyMessage();
    error MessageTooLong();
    error InvalidGuestId();
    error MessageAlreadyRewritten();
    error ContractPaused();
    error NoFundsToWithdraw();
    error InsufficientFee();
    error TokenDoesNotExist();

    /* EVENTS */
    event Gm();
    event GuestbookSigned(
        uint256 indexed guestId,
        address indexed guest,
        string message,
        uint256 timestamp,
        uint256 tokenId
    );
    event GuestbookMessageRewritten(uint256 indexed guestId, uint256 timestamp);
    event PausedStateChanged(bool isPaused);
    event GmMessageUpdated(string newMessage);
    event NFTMinted(uint256 indexed tokenId, address indexed owner);
    event RendererUpdated(address newRenderer);
    event MetadataUpdate(uint256 indexed tokenId);

    /**
     * @notice Contract constructor.
     */
    constructor() ERC721("TheGuestbookNFT", "GUEST") Ownable(msg.sender) {
        renderer = address(new SVGRenderer());
        _gmMessage = "gm";
        emit Gm();
    }

    /* MODIFIERS */
    modifier whenNotPaused() {
        if (_paused) revert ContractPaused();
        _;
    }

    /**
     * @notice Signs the guestbook with the pre-defined "gm" message.
     * @param mintNFT If true, mints an NFT in addition to signing.
     * @return guestId The new guest ID.
     * @return tokenId The NFT token ID (0 if no NFT is minted).
     */
    function signGuestbookGm(bool mintNFT)
        external
        payable
        whenNotPaused
        returns (uint256 guestId, uint256 tokenId)
    {
        // Gas optimization: Inline fee check rather than computing fee first
        if (mintNFT && msg.value < NFT_FEE) revert InsufficientFee();

        // Gas optimization: Initialize tokenId directly to 0
        tokenId = 0;
        
        // Gas optimization: Consolidate mint logic
        if (mintNFT) {
            unchecked { _tokenIdCounter++; }
            tokenId = _tokenIdCounter;
        }
        
        // Gas optimization: Use unchecked for counter increment
        unchecked { _guestCount++; }
        guestId = _guestCount;
        
        // Emit event first to optimize gas (avoids potential storage reads after writes)
        emit GuestbookSigned(guestId, msg.sender, _gmMessage, block.timestamp, tokenId);

        // Gas optimization: Only perform these operations if minting
        if (mintNFT) {
            _guestToToken[guestId] = tokenId;
            
            // Gas optimization: Group storage writes together
            nftData[tokenId] = NFTData({
                author: msg.sender,
                message: _gmMessage,
                timestamp: block.timestamp,
                blockNumber: block.number
            });
            
            // Gas optimization: Direct mint instead of helper function
            _mint(msg.sender, tokenId);
            emit NFTMinted(tokenId, msg.sender);
        }

        return (guestId, tokenId);
    }

    /**
     * @notice Signs the guestbook with a custom message.
     * @param message The custom message (0–140 characters).
     * @param mintNFT If true, mints an NFT in addition to signing.
     * @return guestId The new guest ID.
     * @return tokenId The NFT token ID (0 if no NFT is minted).
     */
    function signGuestbookCustom(string calldata message, bool mintNFT)
        external
        payable
        whenNotPaused
        returns (uint256 guestId, uint256 tokenId)
    {
        // Gas optimization: Simplified fee check with early return pattern
        uint256 requiredFee = CUSTOM_MSG_FEE;
        if (mintNFT) requiredFee += NFT_FEE;
        if (msg.value < requiredFee) revert InsufficientFee();
        
        // Validate message length
        uint256 messageLength = bytes(message).length;
        if (messageLength == 0) revert EmptyMessage();
        if (messageLength > 140) revert MessageTooLong();

        // Gas optimization: Initialize tokenId directly
        tokenId = 0;
        
        // Gas optimization: Consolidate mint logic
        if (mintNFT) {
            unchecked { _tokenIdCounter++; }
            tokenId = _tokenIdCounter;
        }
        
        // Gas optimization: Use unchecked for counter increment
        unchecked { _guestCount++; }
        guestId = _guestCount;
        
        // Emit event first to optimize gas
        emit GuestbookSigned(guestId, msg.sender, message, block.timestamp, tokenId);

        // Gas optimization: Only perform operations if minting
        if (mintNFT) {
            _guestToToken[guestId] = tokenId;
            
            // Gas optimization: Group storage writes
            nftData[tokenId] = NFTData({
                author: msg.sender,
                message: message,
                timestamp: block.timestamp,
                blockNumber: block.number
            });
            
            // Gas optimization: Direct mint
            _mint(msg.sender, tokenId);
            emit NFTMinted(tokenId, msg.sender);
        }

        return (guestId, tokenId);
    }

    /**
     * @notice Withdraws all funds from the contract to the owner's address.
     */
    function withdrawAll() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        // Gas optimization: Use call instead of transfer 
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Rewrites a guest message to the current "gm" message.
     * @param guestId The guest ID to rewrite.
     */
    function rewriteMessage(uint256 guestId) external onlyOwner {
        // Gas optimization: Combined condition check
        if (guestId == 0 || guestId > _guestCount) revert InvalidGuestId();
        if (_rewrittenMessages[guestId]) revert MessageAlreadyRewritten();

        _rewrittenMessages[guestId] = true;
        
        // Gas optimization: Only look up token if needed for event
        uint256 tokenId = _guestToToken[guestId];
        if (tokenId != 0) {
            emit MetadataUpdate(tokenId);
        }
        
        emit GuestbookMessageRewritten(guestId, block.timestamp);
    }

    /**
     * @notice Updates the "gm" message used for rewrites.
     * @param newGmMessage The new "gm" message.
     */
    function updateGmMessage(string calldata newGmMessage) external onlyOwner {
        _gmMessage = newGmMessage;
        emit GmMessageUpdated(newGmMessage);
    }

    /**
     * @notice Pauses or unpauses the contract.
     * @param isPaused New paused state.
     */
    function setPaused(bool isPaused) external onlyOwner {
        _paused = isPaused;
        emit PausedStateChanged(isPaused);
    }

    /**
     * @notice Updates the renderer address.
     * @param newRenderer The new renderer contract address.
     */
    function updateRenderer(address newRenderer) external onlyOwner {
        renderer = newRenderer;
        emit RendererUpdated(newRenderer);
    }

    /**
     * @notice Returns the total number of guestbook entries.
     */
    function getGuestCount() external view returns (uint256) {
        return _guestCount;
    }

    /**
     * @notice Checks if a guest message has been rewritten.
     * @param guestId The guest ID to check.
     */
    function isMessageRewritten(uint256 guestId) external view returns (bool) {
        if (guestId == 0 || guestId > _guestCount) revert InvalidGuestId();
        return _rewrittenMessages[guestId];
    }

    /**
     * @notice Returns the paused state of the contract.
     */
    function paused() external view returns (bool) {
        return _paused;
    }

    /**
     * @notice Returns the current "gm" message.
     */
    function getGmMessage() external view returns (string memory) {
        return _gmMessage;
    }

    /**
     * @notice Returns the token URI for a given NFT by delegating to the external renderer.
     * @param tokenId The NFT token ID.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Gas optimization: Use direct author check for token existence
        if (nftData[tokenId].author == address(0)) revert TokenDoesNotExist();
        
        // Gas optimization: Use memory struct to reduce SLOAD operations
        NFTData memory data = nftData[tokenId];
        string memory formattedDate = Utils.formatTimestamp(data.timestamp);
        string memory sanitizedMessage = Utils.sanitizeInput(data.message);
        
        return IRenderer(renderer).tokenURI(
            tokenId, 
            data.author, 
            sanitizedMessage, 
            formattedDate, 
            data.blockNumber
        );
    }

    /**
     * @notice Fallback function to receive Ether.
     */
    receive() external payable { }
}