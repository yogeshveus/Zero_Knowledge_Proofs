// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IVerifierGroth16.sol";

contract SupplyChain_1 {
    address public admin;
    IVerifierGroth16 public verifier;

    struct Item {
        uint256 id;
        address manufacturer;
        bytes32 metadataHash;
        uint256 registeredAt;
        uint256[] publicSignals;
        bool exists;
    }

    mapping(uint256 => Item) public items;

    event ItemRegistered(uint256 indexed itemId, address indexed manufacturer, bytes32 metadataHash);
    event ItemVerified(uint256 indexed itemId, address indexed verifierAddress, bool success);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _verifier) {
        admin = msg.sender;
        verifier = IVerifierGroth16(_verifier);
    }

    function registerItem(
        uint256 itemId,
        bytes32 metadataHash,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[] calldata publicSignals
    ) external {
        require(!items[itemId].exists, "Already registered");

        bool valid = verifier.verifyProof(a, b, c, publicSignals);
        require(valid, "Invalid ZKP");

        Item storage it = items[itemId];
        it.id = itemId;
        it.manufacturer = msg.sender;
        it.metadataHash = metadataHash;
        it.registeredAt = block.timestamp;
        it.exists = true;

        for (uint i = 0; i < publicSignals.length; i++) {
            it.publicSignals.push(publicSignals[i]);
        }

        emit ItemRegistered(itemId, msg.sender, metadataHash);
    }

    function verifyItem(
    uint256 itemId,
    uint[2] calldata a,
    uint[2][2] calldata b,
    uint[2] calldata c,
    uint[] calldata publicSignals
) external view returns (bool) {
    require(items[itemId].exists, "Item not found");

    Item storage it = items[itemId];

    // Check length match
    require(publicSignals.length == it.publicSignals.length, "Public signals length mismatch");

    // Check each stored public signal equals the input to verify
    for (uint i = 0; i < publicSignals.length; i++) {
        require(publicSignals[i] == it.publicSignals[i], "Public signals mismatch");
    }

    // Run proof verification in verifier.sol
    bool validProof = verifier.verifyProof(a, b, c, publicSignals);
    
    return validProof;
}

}