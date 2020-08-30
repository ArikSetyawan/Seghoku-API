const express = require("express");
const router = express.Router();
const Level_User = require("../models/level_user_model");

router.get("/level_user/", async (req, res) => {
    const queryparams = req.query; //Get Parameters
    if (!queryparams.id_level) {
        //check id_level parameter
        try {
            const query_level_user = await Level_User.find(); // query all level user
            let data_level_user = [];
            query_level_user.forEach((item) => {
                // reformat data
                let data = {
                    id: item._id,
                    nama_level: item.nama_level,
                };
                data_level_user.push(data);
            });
            return res.json({ data: data_level_user, status: "success" });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "something wrong", status: "error" });
        }
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(queryparams.id_level)) {
            return res.json({ messsage: "id_level invalid", status: "error" });
        }
        try {
            // query level_user by id
            const query_level_user = await Level_User.findOne({
                _id: queryparams.id_level,
            });
            //handle if level_user not found
            if (query_level_user === null) {
                return res.json({
                    message: "level user not found",
                    status: "error",
                });
            } else {
                //handle if level_user found
                const data_level_user = {
                    id: query_level_user._id,
                    nama_level: query_level_user.nama_level,
                };
                return res.json({ data: data_level_user, status: "success" });
            }
        } catch (error) {
            return res
                .status(500)
                .json({ message: "something wrong", status: "error" });
        }
    }
});

router.post("/level_user/", async (req, res) => {
    const data = req.body; // get json data
    // check required data
    if (!data.nama_level) {
        return res
            .status(400)
            .json({ message: "Please fill nama_level", status: "error" });
    } else {
        //create new object level_user
        const level_user = new Level_User({
            nama_level: data.nama_level,
        });
        try {
            const saveleveluser = await level_user.save(); //save level user
            return res.json({ message: "Level User saved", status: "success" });
        } catch (error) {
            //handle if level user is exists
            return res.json({
                message: "Level User Already exist",
                status: "error",
            });
        }
    }
});

router.put("/level_user/", async (req, res) => {
    const data = req.body; // get json data
    //check required data
    if (!data.nama_level || !data.id_level) {
        return res.status(400).json({
            message: "Please fill id_level and nama_level",
            status: "error",
        });
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(data.id_level)) {
            return res.json({ messsage: "id_level invalid", status: "error" });
        }
        // Check user is exist
        const cek_level_user = await Level_User.findOne({ _id: data.id_level });
        if (cek_level_user === null) {
            return res.json({
                message: "Level User Not Found",
                status: "error",
            });
        } else {
            try {
                // handle update user
                const update_level_user = await Level_User.updateOne(
                    { _id: data.id_level },
                    { $set: { nama_level: data.nama_level } }
                );
                return res.json({
                    message: "Level User Updated",
                    status: "success",
                });
            } catch (error) {
                // handle level user is exists
                return res.json({
                    message: "Level User Already exist",
                    status: "error",
                });
            }
        }
    }
});

router.delete("/level_user/", async (req, res) => {
    const queryparams = req.query;
    if (!queryparams.id_level) {
        return res.json({ message: "id_user is required", status: "error" });
    } else {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(queryparams.id_level)) {
            return res.json({ messsage: "id_level invalid", status: "error" });
        }
        // Check user is exist
        const cek_level_user = await Level_User.findOne({
            _id: queryparams.id_level,
        });
        if (cek_level_user === null) {
            return res.json({
                message: "Level User Not Found",
                status: "error",
            });
        } else {
            try {
                // Delete Level User
                const delete_level_user = await Level_User.remove({
                    _id: queryparams.id_level,
                });
                return res.json({
                    message: "Level User Deleted",
                    status: "Success",
                });
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

module.exports = router;
