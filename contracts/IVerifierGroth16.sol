// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IVerifierGroth16 {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[] calldata input
    ) external view returns (bool);
}