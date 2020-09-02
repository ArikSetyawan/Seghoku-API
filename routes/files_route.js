const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/files/", async (req, res) => {
    const params = req.query;
    if (!params.filename) {
        return res.json({ message: "Please fill filename", status: "error" });
    } else {
        const file = path.join(
            __dirname,
            "../",
            "public",
            "images",
            params.filename
        );
        if (fs.existsSync(file)) {
            return res
                .status(200)
                .sendFile(
                    path.join(
                        __dirname,
                        "../",
                        "public",
                        "images",
                        params.filename
                    )
                );
        } else {
            return res
                .status(404)
                .json({ message: "File Not Found", status: "error" });
        }
    }
});

module.exports = router;
