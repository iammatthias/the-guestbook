// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Utils Library
 * @notice Provides utility functions for string sanitization and timestamp formatting.
 * @dev Contains helper functions used in TheGuestbook contract.
 */
library Utils {
    using Strings for uint256;

    /**
     * @notice Sanitizes an input string by filtering out disallowed characters.
     * @dev Only allows alphanumeric characters, spaces, punctuation, emojis, and line breaks.
     * @param input The input string to sanitize.
     * @return The sanitized string.
     */
    function sanitizeInput(string memory input) internal pure returns (string memory) {
        bytes memory strBytes = bytes(input);
        bytes memory sanitized = new bytes(strBytes.length);
        uint256 j = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            bytes1 char = strBytes[i];
            // Allow alphanumeric, spaces, punctuation, emojis, and line breaks.
            if (
                (char >= 0x30 && char <= 0x39) // 0-9
                    || (char >= 0x41 && char <= 0x5A) // A-Z
                    || (char >= 0x61 && char <= 0x7A) // a-z
                    || (char >= 0x20 && char <= 0x2F) // Space and punctuation
                    || (char >= 0x3A && char <= 0x40) // More punctuation
                    || (char >= 0x5B && char <= 0x60) // Brackets
                    || (char >= 0x7B && char <= 0x7E) // More symbols
                    || char == 0x0A // Line break
                    || (char >= 0x80) // Unicode characters (emoji support)
            ) {
                sanitized[j] = char;
                j++;
            }
        }
        return string(sanitized);
    }

    /**
     * @notice Formats a UNIX timestamp into a human-readable date string.
     * @dev The output format is "YYYY-MM-DD HH:MM UTC".
     * @param timestamp The UNIX timestamp to format.
     * @return A string representing the formatted date.
     */
    function formatTimestamp(uint256 timestamp) internal pure returns (string memory) {
        uint256 SECONDS_PER_MINUTE = 60;
        uint256 SECONDS_PER_HOUR = 3600;
        uint256 SECONDS_PER_DAY = 86400;
        uint256 daysSinceEpoch = timestamp / SECONDS_PER_DAY;
        uint256 secondsInDay = timestamp % SECONDS_PER_DAY;
        uint256 hourValue = secondsInDay / SECONDS_PER_HOUR;
        uint256 minuteValue = (secondsInDay % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE;
        return string(
            abi.encodePacked(
                _computeDate(daysSinceEpoch),
                " ",
                hourValue < 10 ? string(abi.encodePacked("0", hourValue.toString())) : hourValue.toString(),
                ":",
                minuteValue < 10 ? string(abi.encodePacked("0", minuteValue.toString())) : minuteValue.toString(),
                " UTC"
            )
        );
    }

    /**
     * @dev Computes a date string (YYYY-MM-DD) from the number of days since the UNIX epoch.
     * @param daysSinceEpoch The number of days since January 1, 1970.
     * @return A string representing the date.
     */
    function _computeDate(uint256 daysSinceEpoch) private pure returns (string memory) {
        uint256 z = daysSinceEpoch + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
        uint256 y = yoe + era * 400;
        uint256 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
        uint256 mp = (5 * doy + 2) / 153;
        uint256 d = doy - (153 * mp + 2) / 5 + 1;
        uint256 m = mp < 10 ? mp + 3 : mp - 9;
        y = y + (m <= 2 ? 1 : 0);
        return string(
            abi.encodePacked(
                y.toString(),
                "-",
                m < 10 ? string(abi.encodePacked("0", m.toString())) : m.toString(),
                "-",
                d < 10 ? string(abi.encodePacked("0", d.toString())) : d.toString()
            )
        );
    }
}
