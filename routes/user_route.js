const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user_model");

router.get("/users/", async (req, res) => {
    const params = req.query; // Get Parameters
    //Check if id_user in parameters
    if (!params.id_user) {
        try {
            const query_user = await User.find(); // Query all Users
            let data_user = [];
            query_user.forEach((item) => {
                // reformat data
                let data = {
                    id: item._id,
                    id_level: item.id_level,
                    nama: item.nama,
                    email: item.email,
                    password: item.password,
                };
                data_user.push(data);
            });
            return res.json({ data: data_user, status: "success" });
        } catch (error) {
            return res.json(error);
        }
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_user)) {
            return res.json({ messsage: "id_user invalid", status: "error" });
        }
        try {
            const query_user = await User.findOne({ _id: params.id_user }); // Query user by id_user
            //Handle if user not found
            if (query_user === null) {
                return res.json({
                    messsage: "User not found",
                    status: "error",
                });
            } else {
                // Handle user found
                const data_user = {
                    id: query_user._id,
                    id_level: query_user.id_level,
                    nama: query_user.nama,
                    email: query_user.email,
                    password: query_user.password,
                };
                return res.json({ data: data_user, status: "success" });
            }
        } catch (error) {
            return res.json({
                messsage: "User not found",
                status: "error",
            });
        }
    }
});

router.post("/users/", async (req, res) => {
    const data = req.body; // Get json data
    // Check required data
    if (!data.id_level || !data.nama || !data.email || !data.password) {
        return res.json({
            messsage: "Please fill id_level, nama, email, and password",
            status: "error",
        });
    } else {
        // create new user object
        const newuser = new User({
            id_level: data.id_level,
            nama: data.nama,
            email: data.email,
            password: data.password,
        });
        try {
            // save user
            const saveuser = await newuser.save();
            return res.json({ messsage: "User created", status: "success" });
        } catch (error) {
            // handle duplicate email
            return res.json({
                messsage: "Email already exist",
                status: "error",
            });
        }
    }
});

router.put("/users/", async (req, res) => {
    const data = req.body; // Get Json data
    // Check required data
    if (!data.id_user || !data.nama || !data.password) {
        return res.status(400).json({
            messsage: "please fill id_user, nama, and password",
            status: "error",
        });
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(data.id_user)) {
            return res.json({ messsage: "id_user invalid", status: "error" });
        }
        // Check user is exist
        const cek_user = await User.findOne({ _id: data.id_user });
        if (cek_user === null) {
            return res.json({ messsage: "User not Found", status: "error" });
        } else {
            try {
                // Updating User
                const updateuser = await User.updateOne(
                    { _id: data.id_user },
                    { $set: { nama: data.nama, password: data.password } }
                );
                return res.json({
                    messsage: "User Updated",
                    status: "success",
                });
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

router.delete("/users/", async (req, res) => {
    const params = req.query; // Get Parameters
    // Cek required Parameters
    if (!params.id_user) {
        return res.json({
            messsage: "Id_user parameter required",
            status: "error",
        });
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_user)) {
            return res.json({ messsage: "id_user invalid", status: "error" });
        }
        try {
            // Cek User is Exist
            const cek_user = await User.findOne({ _id: params.id_user });
            if (cek_user === null) {
                return res.json({
                    messsage: "User not Found",
                    status: "error",
                });
            }
            // Delete User
            const delete_user = await User.remove({ _id: params.id_user });
            return res.json({ messsage: "User Deleted", status: "Success" });
        } catch (error) {
            return res.json(error);
        }
    }
});

module.exports = router;
