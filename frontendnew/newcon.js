// ------------------ Variables ------------------
let contract;
const supplyChainAddress = "0x04c243f0b828B3e2A304f97c741855a6E26b25a3";
const abi = [
    "function verifyItem(uint256 itemId, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) view returns (bool)"
];

// ------------------ DOM Loaded ------------------
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("verifyBtn").addEventListener("click", verifyItem);
    document.getElementById("connectBtn").addEventListener("click", connectWallet);
});


// ------------------ Connect MetaMask ------------------
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not found! Install it in Chrome.");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        contract = new ethers.Contract(supplyChainAddress, abi, signer);

        document.getElementById("verifyBtn").disabled = false;
        document.getElementById("walletAddress").innerText = `Connected: ${accounts[0]}`;
        document.getElementById("connectBtn").innerText = "Connected";

        console.log("Connected to MetaMask:", accounts[0]);
    } catch (err) {
        console.error(err);
        alert("Failed to connect to MetaMask: " + err.message);
    }
}

// ------------------ Verify Item ------------------
async function verifyItem() {
    if (!contract) return;

    const itemId = parseInt(document.getElementById("verifyItemId").value);

    // Load a and b from JSON
    let proof;
    try {
        const response = await fetch("proofData.json");
        proof = await response.json();
    } catch (err) {
        console.error("Failed to load proof.json:", err);
        alert("Failed to load proof JSON");
        return;
    }

    const a = proof.a.map(n => BigInt(n));
    const b = proof.b.map(row => row.map(n => BigInt(n)));

    // Take c from user input
    const cInput = document.getElementById("inputC").value.trim();
    const cParts = cInput.split(",").map(s => s.trim());
    /*if (cParts.length !== 2) {
        alert("Enter both c values separated by a comma");
        return;
    }
    const c = cParts.map(n => BigInt(n));*/
    const c = [BigInt(cInput), BigInt(0)];

    // Take publicSignals from user input
    const publicSignalInput = document.getElementById("publicSignal").value.trim();
    if (!publicSignalInput) {
        alert("Enter public signal value");
        return;
    }
    const publicSignals = [BigInt(publicSignalInput)];

    try {
        const isValid = await contract.verifyItem(itemId, a, b, c, publicSignals);
        //document.getElementById("verifyResult").innerText = isValid ? "Valid Proof for item " + itemId : "Invalid Proof for item " + itemId;
        const resultElement = document.getElementById("verifyResult");
        if (isValid) {
            resultElement.innerText = `Valid Proof for item ${itemId}`;
            resultElement.style.color = "#00ff7f"; // soft green
        } else {
            resultElement.innerText = `Invalid Proof for item ${itemId}`;
            resultElement.style.color = "#ff4c4c"; // red
        }

    } catch (err) {
        console.error(err);

        // Extract only the revert reason
        let reason = "Transaction failed";
        if (err.error && err.error.message) {
            // Ethers v5 revert message format
            const match = err.error.message.match(/reverted with reason string "(.*)"/);
            if (match && match[1]) {
                reason = match[1];
            }
        } else if (err.reason) {
            // Some errors may have reason directly
            reason = err.reason;
        }

        document.getElementById("verifyResult").innerText = `Failed to verify item ${itemId}: ${reason}`;
        document.getElementById("verifyResult").style.color = "#ff4c4c"; 

    }
}