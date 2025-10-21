// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Verifier {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[] calldata input
    ) external pure returns (bool) {

        bool valid = (
            a[0] != 0 && 
            b[0][0] != 0 && 
            c[0] != 0 && 
            input.length > 0 && 
            a[0] == b[0][0] && 
            b[1][0] == c[0] &&     
            c[0] == input[0] + 1
        );
        return valid;
    }
}