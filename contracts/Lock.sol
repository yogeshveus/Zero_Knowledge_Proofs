// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HashTest {
    function getHash(uint[2] calldata a, uint[2][2] calldata b) external pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(a[0], a[1], b[0][0], b[0][1], b[1][0], b[1][1])));
    }
}
