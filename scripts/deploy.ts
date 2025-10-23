import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  // Deploy Verifier first
  const Verifier = await ethers.getContractFactory("CryptoVerifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("Verifier deployed to:", verifier.address);

  // Deploy SupplyChain with verifier address
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(verifier.address);
  await supplyChain.deployed();
  console.log("SupplyChain deployed to:", supplyChain.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
