// ------------------ Variables ------------------
let contract;
const supplyChainAddress = "0xC7e8181394444CDaBd97368C3F7D26A6E1fA36e6";
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

  // Parse publicSignals input by user as comma-separated numbers
  let publicSignalsInput = document.getElementById("publicSignals").value;
  let publicSignals = publicSignalsInput.split(",").map(n => parseInt(n.trim()));

  // Load proof a,b,c from JSON
  let proof;
  try {
    const response = await fetch("proof.json");
    proof = await response.json();
  } catch (err) {
    console.error("Failed to load proof.json:", err);
    alert("Failed to load proof JSON");
    return;
  }

  const { a, b, c } = proof;

  try {
    const isValid = await contract.verifyItem(itemId, a, b, c, publicSignals);
    document.getElementById("verifyResult").innerText = isValid ? "✅ Valid Proof" : "❌ Invalid Proof";
  } catch (err) {
    console.error(err);
    document.getElementById("verifyResult").innerText = "❌ Failed to verify item: " + err.message;
  }
}
