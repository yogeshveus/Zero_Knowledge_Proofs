// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CryptoVerifier {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[] calldata input
    ) external pure returns (bool) {
        if (input.length == 0) return false;

        bytes32 hash1 = keccak256(abi.encodePacked(
            a[0], a[1], b[0][0], b[0][1], b[1][0], b[1][1]
        ));

        uint256 hashAsUint = uint256(hash1);

        bool valid = (c[0] == hashAsUint && input[0] == a[0] + b[0][0]);
        return valid;
    }
}
