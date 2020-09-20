const express = require("express");
const router = express.Router();
const User = require("../models/user_model");

router.post("/auth/", async (req, res) => {
    const data = req.body;
    if (!data.email || !data.password) {
        return res.json({
            message: "Please fill email and password",
            status: "error",
        });
    } else {
        // cek user
        const cek_user = await User.findOne({
            email: data.email,
            password: data.password,
        });
        if (cek_user === null) {
            return res.json({
                message: "User not found. Email or Password is wrong",
                status: "error",
            });
        } else {
            const data_user = {
                id: cek_user._id,
                id_level: cek_user.id_level,
                nama: cek_user.nama,
                email: cek_user.email,
                password: cek_user.password,
            };
            return res.json({
                message: "User Found. Welcome",
                data: data_user,
                status: "success",
            });
        }
    }
});

module.exports = router;
