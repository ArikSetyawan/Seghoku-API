const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Tenant = require("../models/tenant_model");
const User = require("../models/user_model");
const Location = require("../models/location_model");

router.get("/tenant/", async (req, res) => {
    const params = req.query; // get parameters
    // check parameters
    if (params.id_tenant && params.id_location) {
        return res.json({ message: "Too much parameters", status: "error" });
    } else if (params.id_tenant) {
        // Handle Query by id_tenant
        // Check if id_tenant is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_tenant)) {
            return res.json({ message: "id_tenant invalid", status: "error" });
        }
        try {
            // get tenant by id
            const query_tenant = await Tenant.findOne({
                _id: params.id_tenant,
            });
            if (query_tenant === null) {
                return res.json({
                    message: "tenant not found",
                    status: "error",
                });
            } else {
                let data_tenant = {
                    id: query_tenant._id,
                    id_user: query_tenant.id_user,
                    id_location: query_tenant.id_location,
                    nama_toko: query_tenant.nama_toko,
                    no_hp: query_tenant.no_hp,
                };
                return res.json({
                    data: data_tenant,
                    status: "success",
                });
            }
        } catch (error) {
            return res.json(error);
        }
    } else if (params.id_location) {
        // Handle Query by id_location
        // Check if id_location is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_location)) {
            return res.json({
                message: "id_location invalid",
                status: "error",
            });
        }
        try {
            // get all tenant base on id_location
            const query_tenant = await Tenant.find({
                id_location: params.id_location,
            });
            let data_tenant = [];
            query_tenant.forEach((item) => {
                let data = {
                    id: item._id,
                    id_user: item.id_user,
                    id_location: item.id_location,
                    nama_toko: item.nama_toko,
                    no_hp: item.no_hp,
                };
                data_tenant.push(data);
            });
            return res.json({
                data: data_tenant,
                status: "success",
            });
        } catch (error) {
            return res.json(error);
        }
    } else {
        // Query All Tenant
        try {
            // get all tenant
            const query_tenant = await Tenant.find();
            let data_tenant = [];
            query_tenant.forEach((item) => {
                let data = {
                    id: item._id,
                    id_user: item.id_user,
                    id_location: item.id_location,
                    nama_toko: item.nama_toko,
                    no_hp: item.no_hp,
                };
                data_tenant.push(data);
            });
            return res.json({
                data: data_tenant,
                status: "success",
            });
        } catch (error) {
            return res.json(error);
        }
    }
});

router.post("/tenant/", async (req, res) => {
    const data = req.body; //Get json data
    // check required data
    if (!data.id_user || !data.id_location || !data.nama_toko || !data.no_hp) {
        return res.json({
            message: "Please fill id_user, id_location, nama_toko, and no_hp",
        });
    } else {
        // Check if id_user and id_location is valid
        if (
            !mongoose.Types.ObjectId.isValid(data.id_location) ||
            !mongoose.Types.ObjectId.isValid(data.id_user)
        ) {
            return res.json({
                message: "id_location or id_user invalid",
                status: "error",
            });
        }
        // Cek User
        const cek_user = await User.findOne({ _id: data.id_user });
        if (cek_user === null) {
            return res.json({ message: "User not found", status: "error" });
        }
        // cek location
        const cek_location = await Location.findOne({ _id: data.id_location });
        if (cek_location === null) {
            return res.json({ message: "Location not found", status: "error" });
        }
        // create new tenant object
        const newtenant = new Tenant({
            id_user: data.id_user,
            id_location: data.id_location,
            nama_toko: data.nama_toko,
            no_hp: data.no_hp,
        });
        try {
            // save tenant
            const savetenant = await newtenant.save();
            return res.json({ message: "Tenant Created", status: "success" });
        } catch (error) {
            if (error.name === "MongoError") {
                if (error.keyPattern.id_user) {
                    return res.json({
                        message: "This User already have tenant",
                        status: "error",
                    });
                } else if (error.keyPattern.nama_toko) {
                    return res.json({
                        message: "Nama Toko already exists",
                        status: "error",
                    });
                } else {
                    return res.json({
                        message: "No hp already exists",
                        status: "error",
                    });
                }
            }
        }
    }
});

router.put("/tenant/", async (req, res) => {
    const data = req.body; // get json data
    // check required data
    if (
        !data.id_tenant ||
        !data.id_location ||
        !data.nama_toko ||
        !data.no_hp
    ) {
        return res.json({
            message: "Please fill id_tenant, id_location, nama_toko, and no_hp",
            status: "error",
        });
    } else {
        // Check if id_tenant and id_location is valid
        if (
            !mongoose.Types.ObjectId.isValid(data.id_location) ||
            !mongoose.Types.ObjectId.isValid(data.id_tenant)
        ) {
            return res.json({
                message: "id_location or id_tenant invalid",
                status: "error",
            });
        }
        // check tenant
        const cek_tenant = await Tenant.findOne({ _id: data.id_tenant });
        if (cek_tenant === null) {
            return res.json({ message: "Tenant Not Found", status: "error" });
        }
        // cek location
        const cek_location = await Location.findOne({ _id: data.id_location });
        if (cek_location === null) {
            return res.json({ message: "Location not found", status: "error" });
        }
        try {
            // Update tenant
            const updatetenant = await Tenant.updateOne(
                { _id: data.id_tenant },
                {
                    $set: {
                        id_location: data.id_location,
                        nama_toko: data.nama_toko,
                        no_hp: data.no_hp,
                    },
                }
            );
            return res.json({ message: "Tenant Updated", status: "success" });
        } catch (error) {
            if (error.name === "MongoError") {
                if (error.keyPattern.nama_toko) {
                    return res.json({
                        message: "Nama Toko already exists",
                        status: "error",
                    });
                } else {
                    return res.json({
                        message: "No hp already exists",
                        status: "error",
                    });
                }
            }
        }
    }
});

router.delete("/tenant/", async (req, res) => {
    const params = req.query; //Get Parameters
    // Check required parameters
    if (!params.id_tenant) {
        return res.json({ message: "please fill id_tenant", status: "error" });
    } else {
        // Check if id_tenant and id_location is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_tenant)) {
            return res.json({
                message: "id_tenant invalid",
                status: "error",
            });
        }
        // cek tenant
        const cek_tenant = await Tenant.findOne({ _id: params.id_tenant });
        if (cek_tenant === null) {
            return res.json({ message: "Tenant  not found", status: "error" });
        } else {
            try {
                // delete tenant
                const deletetenant = await Tenant.remove({
                    _id: params.id_tenant,
                });
                return res.json({
                    message: "Tenant Deleted",
                    status: "success",
                });
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

module.exports = router;
