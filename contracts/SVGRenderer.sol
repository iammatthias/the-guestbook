// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./TheGuestbook.sol";

/**
 * @title SVGRenderer
 * @notice Provides an on-chain SVG rendering implementation for TheGuestbook NFT.
 * @dev Implements the IRenderer interface. Expects to receive a sanitized message and a formatted date.
 */
contract SVGRenderer is IRenderer {
    using Strings for uint256;

    string constant SVG_TOP = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>" "<defs>"
        "<style type='text/css'>" ".background { fill: #f8f7f2; }"
        ".border { stroke: #333; stroke-width: 2; fill: none; }"
        ".header-text { font-family: Courier, monospace; font-weight: bold; font-size: 18px; fill: #333; }"
        ".text { font-family: Courier, monospace; font-size: 12px; fill: #333; }"
        ".message-box { font-family: Courier, monospace; font-size:12px; color:#333; "
        "white-space: pre-wrap; word-wrap: break-word; max-width: 500px; }" "</style>" "</defs>"
        "<rect width='600' height='600' class='background'/>"
        "<rect x='30' y='30' width='540' height='540' class='border'/>"
        "<text x='50' y='60' class='header-text'>THE GUESTBOOK</text>"
        "<line x1='30' y1='75' x2='570' y2='75' stroke='#333' stroke-width='1.5'/>";

    string constant SVG_BOTTOM = "<line x1='30' y1='530' x2='570' y2='530' stroke='#333' stroke-width='2'/>"
        "<text x='50' y='554' class='text'>TRANSMITTED ONCHAIN</text>" "</svg>";

    /**
     * @notice Generates the token URI for a given NFT.
     * @param tokenId The NFT token ID.
     * @param author The address of the NFT creator.
     * @param sanitizedMessage The guest message, already sanitized.
     * @param formattedDate The formatted timestamp.
     * @param blockNumber The block number when the guestbook entry was made.
     * @return A string representing the token URI.
     */
    function tokenURI(
        uint256 tokenId,
        address author,
        string calldata sanitizedMessage,
        string calldata formattedDate,
        uint256 blockNumber
    ) external pure override returns (string memory) {
        // Build the message display using a foreignObject for automatic word-wrap.
        string memory messageHTML = string(
            abi.encodePacked(
                "<foreignObject x='50' y='170' width='500' height='355'>",
                "<body xmlns='http://www.w3.org/1999/xhtml' style='margin: 0;'>",
                "<div class='message-box'>",
                "<p>MESSAGE FOLLOWS</p>",
                "<p>---------------</p>",
                sanitizedMessage,
                "<p>---------------</p>",
                "<p>END OF MESSAGE</p>",
                "</div>",
                "</body>",
                "</foreignObject>"
            )
        );

        string memory svgOutput = string(
            abi.encodePacked(
                SVG_TOP,
                "<text x='50' y='100' class='text'>FROM: ",
                Strings.toHexString(uint256(uint160(author)), 20),
                "</text>",
                "<text x='50' y='120' class='text'>DATE: ",
                formattedDate,
                "</text>",
                "<text x='50' y='140' class='text'>BLOCK: ",
                blockNumber.toString(),
                "</text>",
                messageHTML,
                SVG_BOTTOM
            )
        );

        string memory json = string(
            abi.encodePacked(
                '{"name": "TheGuestbook NFT #',
                tokenId.toString(),
                '", "description": "An onchain guestbook entry with NFT.", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(svgOutput)),
                '", "attributes": [ {"trait_type": "Author", "value": "',
                Strings.toHexString(uint256(uint160(author)), 20),
                '"}, {"trait_type": "Timestamp", "value": "',
                formattedDate,
                '"}, {"trait_type": "Block", "value": "',
                blockNumber.toString(),
                '"}]}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
}
