// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./TheGuestbook.sol";

/**
 * @title SVGRenderer
 * @notice Provides a refined styled SVG renderer for TheGuestbook NFT.
 * @dev Restructured to avoid stack too deep errors.
 */
contract SVGRenderer is IRenderer {
    using Strings for uint256;

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
        // Generate the SVG content
        string memory svgOutput = _generateSVG(
            author,
            sanitizedMessage,
            formattedDate,
            blockNumber
        );
        
        // Generate the metadata JSON
        string memory json = _generateJSON(
            tokenId, 
            author,
            formattedDate,
            blockNumber,
            svgOutput
        );
        
        // Return the base64 encoded JSON
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }
    
    /**
     * @dev Generates the SVG content.
     */
    function _generateSVG(
        address author,
        string calldata sanitizedMessage,
        string calldata formattedDate,
        uint256 blockNumber
    ) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                _getSVGStart(),
                _getAuthorSection(author, formattedDate, blockNumber),
                _getMessageSection(sanitizedMessage),
                _getSVGEnd()
            )
        );
    }
    
    /**
     * @dev Generates the JSON metadata.
     */
    function _generateJSON(
        uint256 tokenId,
        address author,
        string memory formattedDate,
        uint256 blockNumber,
        string memory svgOutput
    ) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                '{"name": "TheGuestbook NFT #',
                tokenId.toString(),
                '", "description": "An onchain retro 90s guestbook entry.", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(svgOutput)),
                '", "attributes": [{"trait_type": "Author", "value": "',
                Strings.toHexString(uint256(uint160(author)), 20),
                '"}, {"trait_type": "Timestamp", "value": "',
                formattedDate,
                '"}, {"trait_type": "Block", "value": "',
                blockNumber.toString(),
                '"}]}'
            )
        );
    }

    /**
     * @dev Returns the SVG start section with styles and background.
     */
    function _getSVGStart() private pure returns (string memory) {
        string memory styles = _getStyles();
        
        return string(
            abi.encodePacked(
                "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'>",
                "<defs>",
                "<style type='text/css'>",
                styles,
                "</style>",
                "</defs>",
                "<rect width='640' height='640' class='background'/>",
                _generateDotPattern(),
                "<rect x='32' y='32' width='576' height='576' class='border'/>",
                "<text x='80' y='80' class='header-text'>THE GUESTBOOK</text>",
                "<line x1='64' y1='96' x2='576' y2='96' class='section-border'/>"
            )
        );
    }
    
    /**
     * @dev Returns CSS styles as a separate function to reduce stack depth.
     */
    function _getStyles() private pure returns (string memory) {
        return string(
            abi.encodePacked(
                ".background{fill:#120440;}",
                ".box{fill:#1A051D;stroke:#00FF00;stroke-width:2;}",
                ".header-text{font-family:monospace;font-weight:bold;font-size:24px;fill:#FFD700;text-anchor:start;}",
                ".text{font-family:monospace;font-size:12px;fill:#7FFFD4;}",
                ".label{font-family:monospace;font-size:12px;fill:#FF69B4;}",
                ".border{stroke:#00FF00;stroke-width:3;fill:none;}",
                ".section-border{stroke:#00FF00;stroke-width:2;stroke-dasharray:5,5;}",
                ".timestamp{font-family:monospace;font-size:12px;fill:#FF1493;}"
            )
        );
    }
    
    /**
     * @dev Generates dot pattern for background.
     */
    function _generateDotPattern() private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<g>",
                "<pattern id='dots' width='16' height='16' patternUnits='userSpaceOnUse'>",
                "<circle cx='8' cy='8' r='1' fill='#4169E1' opacity='0.3'/>",
                "</pattern>",
                "<rect width='640' height='640' fill='url(#dots)'/>",
                "</g>"
            )
        );
    }
    
    /**
     * @dev Returns the author information section with block number.
     */
    function _getAuthorSection(
        address author, 
        string memory formattedDate, 
        uint256 blockNumber
    ) private pure returns (string memory) {
        string memory authorText = string(
            abi.encodePacked(
                "<text x='80' y='132' class='text'><tspan class='label'>FROM: </tspan>",
                Strings.toHexString(uint256(uint160(author)), 20),
                "</text>"
            )
        );
        
        string memory dateText = string(
            abi.encodePacked(
                "<text x='80' y='156' class='text'><tspan class='label'>DATE: </tspan>",
                formattedDate,
                "</text>"
            )
        );
        
        string memory blockText = string(
            abi.encodePacked(
                "<text x='80' y='180' class='text'><tspan class='label'>BLOCK: </tspan>",
                blockNumber.toString(),
                "</text>"
            )
        );
        
        return string(
            abi.encodePacked(
                "<rect x='64' y='112' width='512' height='80' class='box'/>",
                authorText,
                dateText,
                blockText
            )
        );
    }
    
    /**
     * @dev Returns the message section - broken down to avoid stack too deep.
     */
    function _getMessageSection(string memory sanitizedMessage) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<foreignObject x='64' y='208' width='512' height='336'>",
                _getMessageHtml(sanitizedMessage),
                "</foreignObject>"
            )
        );
    }
    
    /**
     * @dev Returns the HTML content for message section.
     */
    function _getMessageHtml(string memory sanitizedMessage) private pure returns (string memory) {
        string memory messageStart = _getMessageStart();
        string memory messageContent = _getMessageContent(sanitizedMessage);
        string memory messageEnd = _getMessageEnd();
        
        return string(
            abi.encodePacked(
                "<div xmlns='http://www.w3.org/1999/xhtml' style='width:100%;height:100%;margin:0;padding:0;box-sizing:border-box;'>",
                "<div style='background-color:#1A051D;border:2px solid #00FF00;color:#7FFFD4;padding:16px;font-family:monospace;width:100%;height:calc(100% - 4px);box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;'>",
                messageStart,
                messageContent,
                messageEnd,
                "</div>",
                "</div>"
            )
        );
    }
    
    /**
     * @dev Returns the top part of the message section.
     */
    function _getMessageStart() private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<div>",
                "<p style='color:#FF00FF;margin:0;padding:0;font-size:12px;line-height:16px;'>* MESSAGE FOLLOWS *</p>",
                unicode"<p style='color:#00FF00;margin:8px 0;padding:0;font-size:12px;line-height:16px;'>■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■</p>"
            )
        );
    }
    
    /**
     * @dev Returns the actual message content.
     */
    function _getMessageContent(string memory sanitizedMessage) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<div style='white-space:pre-wrap;word-wrap:break-word;margin:8px 0;padding:0;font-size:12px;line-height:18px;'>",
                sanitizedMessage,
                "</div>",
                "</div>"
            )
        );
    }
    
    /**
     * @dev Returns the bottom part of the message section.
     */
    function _getMessageEnd() private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<div>",
                unicode"<p style='color:#00FF00;margin:8px 0;padding:0;font-size:12px;line-height:16px;'>■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■</p>",
                "<p style='color:#FF00FF;margin:0;padding:0;font-size:12px;line-height:16px;'>* END OF MESSAGE *</p>",
                "</div>"
            )
        );
    }
    
    /**
     * @dev Returns the SVG end section.
     */
    function _getSVGEnd() private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<line x1='64' y1='560' x2='576' y2='560' class='section-border'/>",
                "<text x='80' y='586' class='text'>TRANSMITTED ONCHAIN</text>",
                "</svg>"
            )
        );
    }
}