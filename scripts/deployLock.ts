import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  // Deploy Verifier first
  const HashTest = await ethers.getContractFactory("HashTest");
  const hashTest = await HashTest.deploy();
  await hashTest.deployed();
  console.log("HashTest deployed to:", hashTest.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
