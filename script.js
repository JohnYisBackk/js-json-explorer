"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const statusDetails = document.getElementById("statusDetails");

const formatBtn = document.getElementById("formatBtn");
const minifyBtn = document.getElementById("minifyBtn");
const visualizeBtn = document.getElementById("visualizeBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const inputSize = document.getElementById("inputSize");
const outputSize = document.getElementById("outputSize");
const jsonInput = document.getElementById("jsonInput");
const jsonOutput = document.getElementById("jsonOutput");
const visualOutput = document.getElementById("visualOutput");

const nodeCount = document.getElementById("nodeCount");

// ======================================================
// APP STATE
// ======================================================

let parsedJSON = null;

let currentOutput = "";

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function parseJSON() {
  const jsonText = jsonInput.value.trim();

  if (jsonText === "") {
    parsedJSON = null;
    setStatus("invalid", "Empty input", "Paste some JSON first.");
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText);

    parsedJSON = parsed;

    setStatus("valid", "Valid JSON", "JSON parsed successfully.");

    return parsed;
  } catch (error) {
    parsedJSON = null;

    setStatus("invalid", "Invalid JSON", error.message);

    return null;
  }
}

function setStatus(type, title, details) {
  statusCard.classList.remove("valid", "invalid", "ready");

  statusCard.classList.add(type);

  statusText.textContent = title;
  statusDetails.textContent = details;
}

function formatJSON(data) {
  return JSON.stringify(data, null, 2);
}

function minifyJSON(data) {
  return JSON.stringify(data);
}

function updateSizes() {
  inputSize.textContent = `${jsonInput.value.length} chars`;
  outputSize.textContent = `${currentOutput.length} chars`;
}

function getValueType(value) {
  if (Array.isArray(value)) return "array";

  if (value === null) return "null";

  return typeof value;
}

function countNodes(data) {
  if (typeof data !== "object" || data === null) {
    return 1;
  }

  let count = 1;

  Object.values(data).forEach((value) => {
    count += countNodes(value);
  });

  return count;
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ======================================================
// ACTIONS
// ======================================================

function handleFormat() {
  const data = parseJSON();

  if (!data) return;

  currentOutput = formatJSON(data);

  jsonOutput.textContent = currentOutput;

  updateSizes();
}

function handleMinify() {
  const data = parseJSON();

  if (!data) return;

  currentOutput = minifyJSON(data);

  jsonOutput.textContent = currentOutput;

  updateSizes();
}

function handleVisualize() {
  const data = parseJSON();

  if (!data) return;

  currentOutput = formatJSON(data);

  jsonOutput.textContent = currentOutput;

  renderVisualJSON(data);

  nodeCount.textContent = `${countNodes(data)} nodes`;

  updateSizes();
}

function handleCopy() {
  if (currentOutput === "") return;

  navigator.clipboard.writeText(currentOutput);

  copyBtn.textContent = "Copied ✓";

  setTimeout(() => {
    copyBtn.textContent = "Copy Output";
  }, 1500);
}

function handleClear() {
  jsonInput.value = "";
  jsonOutput.textContent = "Output will appear here.";

  parsedJSON = null;
  currentOutput = "";

  setStatus("ready", "Ready", "Paste JSON to begin");

  renderEmptyVisual();

  nodeCount.textContent = "0 nodes";

  updateSizes();
}

// ======================================================
// RENDER FUNCTIONS
// ======================================================

function renderVisualJSON(data) {
  visualOutput.innerHTML = "";

  visualOutput.innerHTML = createVisualHTML(data, "Root");
}

function createVisualHTML(value, key) {
  const type = getValueType(value);

  if (type === "object" || type === "array") {
    const entries = type === "array" ? value.entries() : Object.entries(value);

    let innerHTML = "";

    for (const [childKey, childValue] of entries) {
      innerHTML += createVisualHTML(childValue, childKey);
    }

    return `
      <article class="json-card">
        <div class="json-card-header">
          <h3>${escapeHTML(key)}</h3>
          <span class="type-badge">${type}</span>
        </div>

        <div class="nested-block">
          ${innerHTML}
        </div>
      </article>
    `;
  }

  return `
    <div class="json-row">
      <span class="json-key">${escapeHTML(key)}</span>
      <span class="json-value ${type}">${escapeHTML(value)}</span>
    </div>
  `;
}

function renderEmptyVisual() {
  visualOutput.innerHTML = `
    <div class="empty-state">
      <h3>No data yet</h3>
      <p>Paste valid JSON and click Visualize.</p>
    </div>
  `;
}

// ======================================================
// EVENT LISTENERS
// ======================================================

formatBtn.addEventListener("click", handleFormat);
minifyBtn.addEventListener("click", handleMinify);
visualizeBtn.addEventListener("click", handleVisualize);
copyBtn.addEventListener("click", handleCopy);
clearBtn.addEventListener("click", handleClear);

jsonInput.addEventListener("input", () => {
  updateSizes();

  if (jsonInput.value.trim() === "") {
    setStatus("ready", "Ready", "Paste JSON to begin");
  }
});

jsonInput.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    handleFormat();
  }
});

// ======================================================
// INITIAL LOAD
// ======================================================

renderEmptyVisual();
updateSizes();
