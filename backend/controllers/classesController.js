const { getUserClasses } = require("../models/classesModel");

const fetchUserClasses = async (req, res) => {
    const uid = req.params.uid;

    try {
        const classes = await getUserClasses(uid);
        res.json(classes);
    } catch (err) {
        res.status(404).json({ message: "No classes" });
    }
};

module.exports = { fetchUserClasses };