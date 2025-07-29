const admin = require("firebase-admin");

const CACHE_DOC_PATH = "cached/nusmodsModules"; // Firestore doc path

async function fetchAndCacheModules() {
  try {
    const res = await fetch(
      "https://api.nusmods.com/v2/2025-2026/moduleList.json",
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const modules = await res.json();

    // Save to Firestore
    await admin.firestore().doc(CACHE_DOC_PATH).set({
      modules,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Module list cached successfully.");
  } catch (error) {
    console.error("Failed to fetch or cache module list:", error.message);
  }
}

module.exports = { fetchAndCacheModules };
