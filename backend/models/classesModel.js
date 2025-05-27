const db = require("../config/firebase");

const getUserClasses = async (uid) => {
    const classesRef = await db.collection("users").doc(uid).collection("classes").get();

    if (classesRef.empty) {
        return []
    }

    const classes = classesRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))

    return classes
}

module.exports = { getUserClasses };