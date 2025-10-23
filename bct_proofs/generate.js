const { ethers } = require("hardhat");

async function main() {
    // 1️⃣ Deploy HashTest contract
    const HashTest = await ethers.getContractFactory("HashTest");
    const hashTest = await HashTest.deploy();
    await hashTest.deployed();
    console.log("HashTest deployed to:", hashTest.address);

    // 2️⃣ Define your numbers
    const a = [3, 4];
    const b = [[7,1],[2,6]];

    // 3️⃣ Call getHash
    const hash = await hashTest.getHash(a, b);
    console.log("Computed c[0]:", hash.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
