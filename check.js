// checkSepolia.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

  const block = await provider.getBlockNumber();
  console.log("Latest block:", block);
}

main().catch(console.error);
