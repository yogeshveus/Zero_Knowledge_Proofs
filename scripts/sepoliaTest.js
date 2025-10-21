import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Load ABI
const abiPath = path.resolve("./frontend/SupplyChainABI.json");
const SupplyChainABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

// Ethers v6: JsonRpcProvider is a function
const provider = ethers.JsonRpcProvider(process.env.SEPOLIA_URL);

// Signer
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, SupplyChainABI, signer);

async function main() {
  const balance = await signer.getBalance();
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  console.log("Creating product...");
  const tx = await contract.createProduct("Test Product");
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);

  const count = await contract.getProductsCount();
  console.log("Total products:", count.toString());

  for (let i = 0; i < count; i++) {
    const product = await contract.products(i);
    console.log(`ID: ${product.id}, Name: ${product.name}`);
  }
}

main().catch(console.error);
