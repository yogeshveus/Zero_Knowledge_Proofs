// ------------------ Variables ------------------
let contract;
const supplyChainAddress = "0x11EFc070D808F98d89676f87268d4958A9C80E12";
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
// ------------------ Register Item ------------------
async function registerItem() {
  if (!contract) return;

  const itemId = parseInt(document.getElementById("itemId").value);
  const metadataHash = document.getElementById("metadataHash").value;

  // Load ZKP proof from JSON
  let proof;
  try {
    const response = await fetch("newproof.json");
    proof = await response.json();
  } catch (err) {
    console.error("Failed to load newproof.json:", err);
    document.getElementById("registerResult").innerText = "❌ Failed to load newproof.json";
    return;
  }

  let { a, b, c, publicSignals } = proof;

  // Convert all numbers to BigNumber
  a = a.map(x => ethers.BigNumber.from(x));
  b = b.map(row => row.map(x => ethers.BigNumber.from(x)));
  c = c.map(x => ethers.BigNumber.from(x));
  publicSignals = publicSignals.map(x => ethers.BigNumber.from(x));

  try {
    const tx = await contract.registerItem(itemId, metadataHash, a, b, c, publicSignals);
    await tx.wait();
    document.getElementById("registerResult").innerText = "✅ Item " + itemId + " registered successfully!";
  } catch (err) {
    console.error(err);

    // Extract reason from Ethers error
    let reason = "Item already registered or transaction failed";
    try {
      // If provider returned an error object with data
      if (err.error && err.error.data) {
        const data = err.error.data;
        // The actual revert reason can be a string or nested object
        let errorMsg = "";
        if (typeof data === "string") {
          errorMsg = data;
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          errorMsg = data[firstKey]?.reason || "";
        }
        const match = errorMsg.match(/reverted with reason string "(.*)"/);
        if (match && match[1]) reason = match[1];
      } else if (err.reason) {
        reason = err.reason;
      }
    } catch (parseErr) {
      console.error("Failed to parse revert reason:", parseErr);
    }

    document.getElementById("registerResult").innerText = `❌ Failed to register item: ${reason}`;
  }
}


