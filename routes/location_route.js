const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Location = require("../models/location_model");

router.get("/locations/", async (req, res) => {
    const params = req.query; //Get parameters
    // check parameters
    if (!params.id_location) {
        const query_location = await Location.find(); // Query all Locations
        let data_location = [];
        query_location.forEach((item) => {
            let data = {
                id: item._id,
                nama_location: item.nama_location,
            };
            data_location.push(data);
        });
        res.json({ data: data_location, status: "success" });
    } else {
        // Check if id_location is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_location)) {
            return res.json({
                messsage: "id_location invalid",
                status: "error",
            });
        }
        try {
            // get location by specific id
            const query_location = await Location.findOne({
                _id: params.id_location,
            });
            if (query_location === null) {
                return res.json({
                    messsage: "Location not found",
                    status: "error",
                });
            } else {
                const data_location = {
                    id: query_location._id,
                    nama_location: query_location.nama_location,
                };
                return res.json({ data: data_location, status: "success" });
            }
        } catch (error) {
            return res.json(error);
        }
    }
});

router.post("/locations/", async (req, res) => {
    const data = req.body; //get json data
    if (!data.nama_location) {
        return res.json({
            messsage: "please fill nama_location",
            status: "error",
        });
    } else {
        const newlocation = new Location({
            nama_location: data.nama_location,
        });
        try {
            const savelocation = await newlocation.save();
            return res.json({ messsage: "Location saved", status: "success" });
        } catch (error) {
            if (error.name === "MongoError") {
                return res.json({
                    messsage: "Location already exist",
                    status: "error",
                });
            }
            return res.json({
                messsage: "Internal Server Error",
                status: "error",
            });
        }
    }
});

router.put("/locations/", async (req, res) => {
    const data = req.body; //Get json data
    if (!data.id_location || !data.nama_location) {
        return res.json({
            messsage: "Please fill id_location and nama_location",
            status: "error",
        });
    } else {
        // Check if id_location is valid
        if (!mongoose.Types.ObjectId.isValid(data.id_location)) {
            return res.json({
                messsage: "id_location invalid",
                status: "error",
            });
        }
        try {
            // cek location
            const cek_location = await Location.findOne({
                _id: data.id_location,
            });
            if (cek_location === null) {
                return res.json({
                    messsage: "Location not found",
                    status: "error",
                });
            } else {
                // update location
                const updatelocation = await Location.updateOne(
                    { _id: data.id_location },
                    { $set: { nama_location: data.nama_location } }
                );
                return res.json({
                    messsage: "Location updated",
                    status: "success",
                });
            }
        } catch (error) {
            return res.json(error);
        }
    }
});

router.delete("/locations/", async (req, res) => {
    const params = req.query; // Get Parameters
    // cek required parameters
    if (!params.id_location) {
        return res.json({
            messsage: "please fill id_location",
            status: "error",
        });
    } else {
        // Check if id_location is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_location)) {
            return res.json({
                messsage: "id_location invalid",
                status: "error",
            });
        }
        try {
            // Cek location
            const cek_location = await Location.findOne({
                _id: params.id_location,
            });
            if (cek_location === null) {
                return res.json({
                    messsage: "Location not found",
                    status: "error",
                });
            } else {
                // delete location
                const deletelocation = await Location.remove({
                    _id: params.id_location,
                });
                return res.json({
                    messsage: "location deleted",
                    status: "success",
                });
            }
        } catch (error) {
            return res.json(error);
        }
    }
});

module.exports = router;
