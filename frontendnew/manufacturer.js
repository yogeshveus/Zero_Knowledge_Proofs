// ------------------ Variables ------------------
let contract;
let itemIds = {}; // local cache
let selectedProduct = "";
const supplyChainAddress = "0x04c243f0b828B3e2A304f97c741855a6E26b25a3";
const abi = [
  "function registerItem(uint256 itemId, bytes32 metadataHash, uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[] calldata publicSignals) external"
];

// ------------------ DOM Loaded ------------------
window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("registerBtn").addEventListener("click", registerItem);
  document.getElementById("connectBtn").addEventListener("click", connectWallet);

  // Load itemIds.json
  try {
    const response = await fetch("itemIds.json");
    itemIds = await response.json();
  } catch (err) {
    console.error("Failed to load itemIds.json:", err);
  }


  // When product changes
document.getElementById("productDropdown").addEventListener("change", (e) => {
  selectedProduct = e.target.value;

  // Update the displayed item ID
  if (selectedProduct && itemIds[selectedProduct]) {
    document.getElementById("itemIdDisplay").innerText = itemIds[selectedProduct];
  } else {
    document.getElementById("itemIdDisplay").innerText = "—";
  }

  // Handle image dynamically based on product name
  const image = document.getElementById("productImage");

  if (selectedProduct) {
    // Dynamically generate the image path using product name (ID)
    // Example: productDropdown value = "Handbag" → images/handbag.jpg
    const imagePath = `images/${selectedProduct.toLowerCase()}.jpg`;

    image.src = imagePath;
    image.alt = `${selectedProduct} image`;
    image.style.display = "block";
  } else {
    image.style.display = "none";
  }
})});

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
    document.getElementById("walletAddress").innerText = `Connected to wallet address: ${accounts[0]}`;
    document.getElementById("connectBtn").innerText = "Connected";
  } catch (err) {
    console.error(err);
    alert("Failed to connect to MetaMask: " + err.message);
  }
}

// ------------------ Register Item ------------------
async function registerItem() {
  if (!contract) return;
  if (!selectedProduct) {
    alert("Please select a product.");
    return;
  }

  const itemId = itemIds[selectedProduct];
  const metadataHash = document.getElementById("metadataHash").value;

  // Load proof file
  let proof;
  try {
    const response = await fetch("proofData.json");
    proof = await response.json();
  } catch (err) {
    console.error("Failed to load proofData.json:", err);
    document.getElementById("registerResult").innerText = "Failed to load proofData.json";
    return;
  }

  let { a, b, c, publicSignals } = proof;
  a = a.map(x => ethers.BigNumber.from(x));
  b = b.map(row => row.map(x => ethers.BigNumber.from(x)));
  c = c.map(x => ethers.BigNumber.from(x));
  publicSignals = publicSignals.map(x => ethers.BigNumber.from(x));

  try {
    const tx = await contract.registerItem(itemId, metadataHash, a, b, c, publicSignals);
    await tx.wait();

    document.getElementById("registerResult").innerText =
      `${selectedProduct} (ID ${itemId}) registered successfully!`;
    document.getElementById("registerResult").style.color = "#00ff7f";

    // Increment ID locally
    itemIds[selectedProduct]++;
    saveItemIds(itemIds);
    document.getElementById("itemIdDisplay").innerText = itemIds[selectedProduct];
  } catch (err) {
    console.error(err);
    document.getElementById("registerResult").innerText = "Registration failed: " + (err.reason || "unknown error");
    document.getElementById("registerResult").style.color = "#ff4c4c";
  }
}

// ------------------ Save Updated IDs ------------------
async function saveItemIds(updatedData) {
  try {
    await fetch("/save-itemids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
    console.log("itemIds.json updated successfully");
  } catch (err) {
    console.error("Failed to save itemIds.json:", err);
  }
}
