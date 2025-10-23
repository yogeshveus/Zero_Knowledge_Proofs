const { ethers } = require("hardhat");

async function main() {
  // 1️⃣ Deploy your verifier
  const Verifier = await ethers.getContractFactory("CryptoVerifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("Verifier deployed locally at:", verifier.address);

  // 2️⃣ Deploy other contracts that depend on the verifier
  const Manufacturer = await ethers.getContractFactory("SupplyChain");
  const manufacturer = await Manufacturer.deploy(verifier.address);
  await manufacturer.deployed();
  console.log("Manufacturer deployed locally at:", manufacturer.address);

  // 3️⃣ Call functions to simulate usage
  const a = [456782936, 251678395];
  const b = [[912679344, 890134667], [790286902, 541656891]];
  const c = ["5534449593955003150930703514936709279200798574022577126015462283190109123996", "0"];
  const publicSignals = ["6079013816478556472468214500103295372017352741153461292389486439806701423077"];

  const itemId = 12345;
  const result = await verifier.verifyProof(a, b, c, publicSignals);
  console.log("verifyItem result:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
