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
  // Buttons
  document.getElementById("registerBtn").addEventListener("click", registerItem);
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("addProductBtn").addEventListener("click", addNewProduct);

  // Load itemIds.json
  try {
    const response = await fetch("itemIds.json");
    itemIds = await response.json();

    // Populate dropdown
    const dropdown = document.getElementById("productDropdown");
    dropdown.innerHTML = `<option value="">-- Select a product --</option>`;
    for (const productName in itemIds) {
      const option = document.createElement("option");
      option.value = productName;                // internal reference
      option.textContent = itemIds[productName].value; // displayed to user
      dropdown.appendChild(option);
    }
  } catch (err) {
    console.error("Failed to load itemIds.json:", err);
  }

  // When product changes
  document.getElementById("productDropdown").addEventListener("change", (e) => {
    selectedProduct = e.target.value;

    if (selectedProduct && itemIds[selectedProduct]) {
      document.getElementById("itemIdDisplay").innerText = itemIds[selectedProduct].id;
      document.getElementById("productHeading").innerText = itemIds[selectedProduct].value;
    } else {
      document.getElementById("itemIdDisplay").innerText = "—";
      document.getElementById("productHeading").innerText = "";
    }

    // Image preview
    const image = document.getElementById("productImage");
    if (selectedProduct) {
      image.src = `images/${selectedProduct.toLowerCase()}.jpg`;
      image.style.display = "block";
      image.style.maxWidth = "200px";
      image.style.height = "auto";
      image.style.margin = "15px auto";
      image.style.display = "block";
    } else {
      image.style.display = "none";
    }
  });
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
  } catch (err) {
    console.error(err);
    alert("Failed to connect to MetaMask: " + err.message);
  }
}

// ------------------ Add New Product ------------------
async function addNewProduct() {
  const newProduct = document.getElementById("newProductName").value.trim();
  const newId = parseInt(document.getElementById("newProductId").value);
  const newValue = document.getElementById("newProductValue").value.trim();

  if (!newProduct || !newValue || !newId || newId < 1) {
    alert("Please fill all fields correctly.");
    return;
  }

  if (itemIds[newProduct]) {
    alert("This product already exists.");
    return;
  }

  // Add to local itemIds
  itemIds[newProduct] = { id: newId, value: newValue };

  // Add to dropdown
  const dropdown = document.getElementById("productDropdown");
  const option = document.createElement("option");
  option.value = newProduct; 
  option.textContent = newValue; // display human-readable
  dropdown.appendChild(option);

  // Clear input fields
  document.getElementById("newProductName").value = "";
  document.getElementById("newProductId").value = "";
  document.getElementById("newProductValue").value = "";

  // Save to server
  try {
    await saveItemIds(itemIds);
    alert(`${newProduct} added successfully with ID ${newId} and value "${newValue}"`);
  } catch (err) {
    console.error(err);
    alert("Failed to save new product.");
  }
}

// ------------------ Register  ------------------
async function registerItem() {
  if (!contract || !selectedProduct) {
    alert("Select a product and connect wallet first.");
    return;
  }

  const itemId = itemIds[selectedProduct].id;
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
      `${itemIds[selectedProduct].value} (ID ${itemId}) registered successfully!`;
    document.getElementById("registerResult").style.color = "#00ff7f";

    // Increment ID locally
    itemIds[selectedProduct].id++;
    saveItemIds(itemIds);
    document.getElementById("itemIdDisplay").innerText = itemIds[selectedProduct].id;
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
