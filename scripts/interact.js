require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // ✅ Fixed provider for Ethers v5
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Deployed contract addresses
  const verifierAddress = process.env.VERIFIER;
  const supplyChainAddress = process.env.SUPPLYCHAIN;

  // ABIs
  const verifierAbi = [
    "function verifyProof(uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata input) external pure returns (bool)"
  ];

  const supplyChainAbi = [
    "function registerItem(uint256 itemId, bytes32 metadataHash, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) external",
    "function verifyItem(uint256 itemId, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) external view returns (bool)",
    "function items(uint256) view returns (uint256 id, address manufacturer, bytes32 metadataHash, uint256 registeredAt, bool exists)"
  ];

  // Contract instances
  const verifier = new ethers.Contract(verifierAddress, verifierAbi, wallet);
  const supplyChain = new ethers.Contract(supplyChainAddress, supplyChainAbi, wallet);

  console.log("Connected as:", wallet.address);
  console.log("SupplyChain at:", supplyChainAddress);

  // 🔹 Prepare fake proof data
  const a = [1, 2];
  const b = [[1, 2], [3, 1]];   // b[1][0] = c[0] must hold for valid
  const c = [3, 4];
  const publicSignals = [2, 9];   // c[0] == input[0] + 1 → 3 == 2 + 1 ✅

  const metadataHash = ethers.utils.id("Batch#12345");
  const itemId = 1;

  // 🔹 Register an item
  console.log("\nRegistering new item...");
  const tx = await supplyChain.registerItem(
    itemId,
    metadataHash,
    a,
    b,
    c,
    publicSignals
  );
  await tx.wait();
  console.log("✅ Item registered successfully!");

  // 🔹 Verify the item
  console.log("\nVerifying item...");
  const verified = await supplyChain.verifyItem(
    itemId,
    a,
    b,
    c,
    publicSignals
  );
  console.log("Verification result:", verified ? "✅ Valid Proof" : "❌ Invalid Proof");

  // 🔹 Read stored data
  const item = await supplyChain.items(itemId);
  console.log("\nStored Item Data:");
  console.log("  ID:", item.id.toString());
  console.log("  Manufacturer:", item.manufacturer);
  console.log("  Exists:", item.exists);
  console.log("  Metadata Hash:", item.metadataHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
