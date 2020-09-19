const express = require("express");
const router = express.Router();
const Menu = require("../models/menu_model");
const Tenant = require("../models/tenant_model");
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");

// File Dir
const FILEDIR = "./public/images/";

router.get("/menu/", async (req, res) => {
    const params = req.query; //get parameters
    // check parameters
    if (params.id_menu && params.id_tenant) {
        return res.json({ message: "Too much parameters", status: "error" });
    } else if (params.id_menu) {
        // Check if id_menu is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_menu)) {
            return res.json({
                message: "id_menu invalid",
                status: "error",
            });
        }
        try {
            // get menu by id
            const querymenu = await Menu.findOne({ _id: params.id_menu });
            if (querymenu === null) {
                return res.json({ message: "Menu not found", status: "error" });
            } else {
                const data_menu = {
                    id: querymenu._id,
                    id_tenant: querymenu.id_tenant,
                    nama_menu: querymenu.nama_menu,
                    harga_menu: querymenu.harga_menu,
                    foto_menu: querymenu.foto_menu,
                };
                return res.json({ data: data_menu, status: "success" });
            }
        } catch (error) {
            return res.json(error);
        }
    } else if (params.id_tenant) {
        // Check if id_tenant is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_tenant)) {
            return res.json({
                message: "id_tenant invalid",
                status: "error",
            });
        }

        const querymenu = await Menu.find({ id_tenant: params.id_tenant });
        let data_menu = [];
        querymenu.forEach((item) => {
            let data = {
                id: item._id,
                id_tenant: item.id_tenant,
                nama_menu: item.nama_menu,
                harga_menu: item.harga_menu,
                foto_menu: item.foto_menu,
            };
            data_menu.push(data);
        });
        return res.json({ data: data_menu, status: "success" });
    } else {
        // query all menu
        const querymenu = await Menu.find();
        let data_menu = [];
        querymenu.forEach((item) => {
            let data = {
                id: item._id,
                id_tenant: item.id_tenant,
                nama_menu: item.nama_menu,
                harga_menu: item.harga_menu,
                foto_menu: item.foto_menu,
            };
            data_menu.push(data);
        });
        return res.json({ data: data_menu, status: "success" });
    }
});

router.post("/menu/", async (req, res) => {
    const data = req.body;
    // Check required data
    if (!data.id_tenant || !data.nama_menu || !data.harga_menu) {
        return res.json({
            message: "Please fill id_tenant, nama_menu, and harga_menu",
            status: "error",
        });
    }
    // Check if file included
    if (!req.files) {
        return res.json({ message: "please fill FotoMenu", status: "error" });
    } else {
        // Check if id_tenant is valid
        if (!mongoose.Types.ObjectId.isValid(data.id_tenant)) {
            return res.json({
                message: "id_tenant invalid",
                status: "error",
            });
        }

        // check tenant if exist
        const cek_tenant = await Tenant.findOne({ _id: data.id_tenant });
        if (cek_tenant === null) {
            return res.json({ message: "Tenant Not Found", status: "error" });
        } else {
            try {
                // Get File
                const image = req.files.FotoMenu;
                // Check File if included
                if (image === undefined) {
                    return res.json({
                        message: "please fill FotoMenu",
                        status: "error",
                    });
                }

                // Get Ext
                const ext = image.name.split(".")[1];
                // Check Ext
                if (ext === "png" || ext === "jpg" || ext === "jpeg") {
                    // Set Filename
                    const filename = `${crypto
                        .randomBytes(20)
                        .toString("hex")}.${ext}`;

                    // create new menu object
                    const newmenu = new Menu({
                        id_tenant: data.id_tenant,
                        nama_menu: data.nama_menu,
                        harga_menu: data.harga_menu,
                        foto_menu: filename,
                    });

                    // save menu
                    const savemenu = await newmenu.save();

                    // Save image
                    const savefile = image.mv(`${FILEDIR}${filename}`);
                } else {
                    return res.json({
                        message: "Extension not allowed",
                        status: "error",
                    });
                }
                return res.json({ message: "Menu Created", status: "success" });
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

router.put("/menu/", async (req, res) => {
    const data = req.body; // get json data
    // check required data
    if (!data.id_menu || !data.nama_menu || !data.harga_menu) {
        return res.json({
            message: "please fill id_menu, nama_menu, harga_menu",
        });
    } else {
        // Check if id_menu is valid
        if (!mongoose.Types.ObjectId.isValid(data.id_menu)) {
            return res.json({
                message: "id_menu invalid",
                status: "error",
            });
        }
        // check menu is exist
        const cek_menu = await Menu.findOne({ _id: data.id_menu });
        if (cek_menu === null) {
            return res.json({ message: "Menu Not Found", status: "error" });
        }

        if (!req.files) {
            try {
                const updatemenu = await Menu.updateOne(
                    { _id: data.id_menu },
                    {
                        $set: {
                            nama_menu: data.nama_menu,
                            harga_menu: data.harga_menu,
                        },
                    }
                );
                return res.json({ message: "Menu Updated", status: "success" });
            } catch (error) {
                return res.json(error);
            }
        } else {
            try {
                // Get File
                const image = req.files.FotoMenu;
                // Check File if included
                if (image === undefined) {
                    return res.json({
                        message: "please fill FotoMenu",
                        status: "error",
                    });
                }

                // Get Ext
                const ext = image.name.split(".")[1];
                // Check Ext
                if (ext === "png" || ext === "jpg" || ext === "jpeg") {
                    // Set Filename
                    const filename = `${crypto
                        .randomBytes(20)
                        .toString("hex")}.${ext}`;

                    // delete old photo
                    fs.unlinkSync(`${FILEDIR}${cek_menu.foto_menu}`);

                    // update menu in database
                    const updatemenu = await Menu.updateOne(
                        { _id: data.id_menu },
                        {
                            $set: {
                                nama_menu: data.nama_menu,
                                harga_menu: data.harga_menu,
                                foto_menu: filename,
                            },
                        }
                    );

                    // Save image
                    const savefile = image.mv(`${FILEDIR}${filename}`);
                    return res.json({
                        message: "Menu Updated",
                        status: "success",
                    });
                } else {
                    return res.json({
                        message: "Extension not allowed",
                        status: "error",
                    });
                }
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

router.delete("/menu/", async (req, res) => {
    const params = req.query; // get parameters
    // check parameters
    if (!params.id_menu) {
        return res.json({ message: "please fill id_menu" });
    } else {
        // Check if id_menu is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_menu)) {
            return res.json({
                message: "id_menu invalid",
                status: "error",
            });
        }

        // check menu is exist
        const cek_menu = await Menu.findOne({ _id: params.id_menu });
        if (cek_menu === null) {
            return res.json({ message: "Menu Not Found", status: "error" });
        } else {
            try {
                // delete menu
                const deletemenu = await Menu.remove({ _id: params.id_menu });

                // delete old photo
                fs.unlinkSync(`${FILEDIR}${cek_menu.foto_menu}`);

                return res.json({ message: "Menu deleted", status: "success" });
            } catch (error) {
                return res.json(error);
            }
        }
    }
});

module.exports = router;
