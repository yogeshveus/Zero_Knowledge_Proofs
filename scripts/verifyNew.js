const { ethers } = require("hardhat");

function toBytes32(n) {
    // Convert JS number or BigInt to 32-byte hex string
    return ethers.utils.hexZeroPad(ethers.BigNumber.from(n).toHexString(), 32);
}

async function main() {
    // Example proof numbers
    const a = [3, 4];
    const b = [[7, 1], [2, 6]];
    
    // 1️⃣ Compute the packed bytes like Solidity's abi.encodePacked
    const packed =
        toBytes32(a[0]).slice(2) +
        toBytes32(a[1]).slice(2) +
        toBytes32(b[0][0]).slice(2) +
        toBytes32(b[0][1]).slice(2) +
        toBytes32(b[1][0]).slice(2) +
        toBytes32(b[1][1]).slice(2);
    
    const packedBytes = "0x" + packed;

    // 2️⃣ Compute keccak256 hash
    const hash = ethers.utils.keccak256(packedBytes);
    const c0 = ethers.BigNumber.from(hash);

    console.log("Computed c[0]:", c0.toString());

    // 3️⃣ Deploy verifier
    const Verifier = await ethers.getContractFactory("CryptoVerifier");
    const verifier = await Verifier.deploy();
    await verifier.deployed();
    console.log("Verifier deployed to:", verifier.address);

    // 4️⃣ Prepare proof and public input
    const proof = {
        a: a,
        b: b,
        c: [c0.toString(), 0] // Second element must exist for uint[2]
    };
    const publicInput = {
        input: [a[0] + b[0][0]] // input[0] = a[0] + b[0][0] per verifier logic
    };

    // 5️⃣ Verify proof
    const valid = await verifier.verifyProof(
        proof.a,
        proof.b,
        proof.c,
        publicInput.input
    );

    console.log("Proof valid?", valid);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
