// ------------------ Variables ------------------
let contract;
const supplyChainAddress = "0xC7e8181394444CDaBd97368C3F7D26A6E1fA36e6";
const abi = [
  "function registerItem(uint256 itemId, bytes32 metadataHash, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) external"
];

// ------------------ DOM Loaded ------------------
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("registerBtn").addEventListener("click", registerItem);
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

    document.getElementById("registerBtn").disabled = false;
    document.getElementById("walletAddress").innerText = `Connected: ${accounts[0]}`;
    document.getElementById("connectBtn").innerText = "Connected";
    console.log("Connected to MetaMask:", accounts[0]);
  } catch (err) {
    console.error(err);
    alert("Failed to connect to MetaMask: " + err.message);
  }
}

// ------------------ Register Item ------------------
/*async function registerItem() {
  if (!contract) return;

  const itemId = parseInt(document.getElementById("itemId").value);
  const metadataHash = document.getElementById("metadataHash").value;

  const a = [1, 2];
  const b = [[1, 2], [3, 4]];
  const c = [3, 4];
  const publicSignals = [2];

  try {
    const tx = await contract.registerItem(itemId, metadataHash, a, b, c, publicSignals);
    await tx.wait();
    document.getElementById("registerResult").innerText = "✅ Item registered successfully!";
  } catch (err) {
    console.error(err);
    document.getElementById("registerResult").innerText = "❌ Failed to register item: " + err.message;
  }
}*/
async function registerItem() {
  if (!contract) return;

  const itemId = parseInt(document.getElementById("itemId").value);
  const metadataHash = document.getElementById("metadataHash").value;

  // Load ZKP proof from JSON
  let proof;
  try {
    const response = await fetch("proof.json");
    proof = await response.json();
  } catch (err) {
    console.error("Failed to load proof.json:", err);
    return;
  }

  const { a, b, c, publicSignals } = proof;

  try {
    const tx = await contract.registerItem(itemId, metadataHash, a, b, c, publicSignals);
    await tx.wait();
    document.getElementById("registerResult").innerText = "✅ Item registered successfully!";
  } catch (err) {
    console.error(err);
    document.getElementById("registerResult").innerText = "❌ Failed to register item: " + err.message;
  }
}


