const { ethers } = require("hardhat");

async function main() {
    // 1️⃣ Deploy HashTest contract
    const HashTest = await ethers.getContractFactory("HashTest");
    const hashTest = await HashTest.deploy();
    await hashTest.deployed();
    console.log("✅ HashTest deployed to:", hashTest.address);

    // 2️⃣ Define your numbers
    const a = [456782936, 251678395];
    const b = [
        [912679344, 890134667],
        [790286902, 541656891]
    ];

    // 3️⃣ Call getHashes to get all 3
    const [hash1, hash2, hash3] = await hashTest.getHashes(a, b);

    // 4️⃣ Print nicely
    console.log("\n🔹 Hash Results:");
    console.log("c[0]  (hash1):", hash1.toString());
    console.log("hash2:", hash2.toString());
    console.log("input[0] (hash3):", hash3.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

/*    const a = [3, 4];
    const b = [[7,1],[2,6]];
    */
