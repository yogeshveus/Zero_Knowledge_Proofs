// scripts/interact.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Replace with your deployed contract address
  const supplyChainAddress = process.env.SUPPLYCHAIN;

  // Minimal ABI with only the functions we need
  const abi = [
    "function verifyItem(uint256 itemId, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) view returns (bool)",
    "function items(uint256) view returns (uint256 id, address manufacturer, bytes32 metadataHash, uint256 registeredAt, uint256[] memory publicSignals, bool exists)"
  ];

  const contract = new ethers.Contract(supplyChainAddress, abi, wallet);

  // Replace these with the actual proof you used when registering the item
  const itemId = 1;

  // Example proof values (replace with actual ones you registered with)
  const a = [1, 2];
  const b = [
    [1, 2],
    [3, 1]
  ];
  const c = [3, 4];
  const publicSignals = [2, 9]; // Must match the stored publicSignals

  console.log(`Verifying item ${itemId}...`);

  try {
    const isValid = await contract.verifyItem(itemId, a, b, c, publicSignals);
    console.log(`Verification result: ${isValid ? "✅ Valid Proof" : "❌ Invalid Proof"}`);

    // Optional: fetch stored item data
    const item = await contract.items(itemId);
    console.log("\nStored Item Data:");
    console.log("ID:", item.id.toString());
    console.log("Manufacturer:", item.manufacturer);
    console.log("Exists:", item.exists);
    console.log("Metadata Hash:", item.metadataHash);
    console.log("Public Signals:", item.publicSignals.map(x => x.toString()));
  } catch (err) {
    console.error("Error verifying item:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
