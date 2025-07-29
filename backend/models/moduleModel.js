const { db } = require("../config/firebase");

const fetchModules = async () => {
  const moduleDoc = await db.collection("cached").doc("nusmodsModules").get();
  console.log(moduleDoc);

  if (!moduleDoc.exists) {
    throw new Error("404 Not found");
  }

  return { id: moduleDoc.id, ...moduleDoc.data() };
};

module.exports = { fetchModules };
