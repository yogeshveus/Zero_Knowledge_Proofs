// ------------------ Variables ------------------
let contract;
const supplyChainAddress = "0xC7e8181394444CDaBd97368C3F7D26A6E1fA36e6";
const abi = [
  "function registerItem(uint256 itemId, bytes32 metadataHash, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) external",
  "function verifyItem(uint256 itemId, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) view returns (bool)"
];

// ------------------ DOM Loaded ------------------
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("registerBtn").addEventListener("click", registerItem);
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
    // Directly request accounts (triggers popup)
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(supplyChainAddress, abi, signer);

    // Enable buttons
    document.getElementById("registerBtn").disabled = false;
    document.getElementById("verifyBtn").disabled = false;
    document.getElementById("walletAddress").innerText = `Connected: ${accounts[0]}`;
    document.getElementById("connectBtn").innerText = "Connected";

    console.log("Connected to MetaMask:", accounts[0]);
  } catch (err) {
    console.error(err);
    alert("Failed to connect to MetaMask: " + err.message);
  }
}

// ------------------ Register Item ------------------
async function registerItem() {
  if (!contract) return;

  const itemId = parseInt(document.getElementById("itemId").value);
  const metadataHash = document.getElementById("metadataHash").value;

  // Example ZKP proof & publicSignals (replace with your real proof)
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
}

// ------------------ Verify Item ------------------
async function verifyItem() {
  if (!contract) return;

  const itemId = parseInt(document.getElementById("verifyItemId").value);

  // Example ZKP proof & publicSignals (replace with your real proof)
  const a = [1, 2];
  const b = [[1, 2], [3, 4]];
  const c = [3, 4];
  const publicSignals = [2];

  try {
    const isValid = await contract.verifyItem(itemId, a, b, c, publicSignals);
    document.getElementById("verifyResult").innerText = isValid ? "✅ Valid Proof" : "❌ Invalid Proof";
  } catch (err) {
    console.error(err);
    document.getElementById("verifyResult").innerText = "❌ Failed to verify item: " + err.message;
  }
}
