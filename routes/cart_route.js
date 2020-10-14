const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// import model
const Cart = require("../models/cart_model");
const User = require("../models/user_model");
const Menu = require("../models/menu_model");

router.get("/cart/", async (req, res) => {
    const params = req.query;
    const jumlah_params = Object.keys(params).length;
    if (jumlah_params > 1) {
        return res.json({ message: "too much parameter", status: "error" });
    } else if (params.id_cart) {
        if (!mongoose.Types.ObjectId.isValid(params.id_cart)) {
            return res.json({
                message: "id_cart invalid",
                status: "error",
            });
        }
        // get cart
        const data_cart = await Cart.findOne({ _id: params.id_cart });
        if (data_cart === null) {
            return res.json({ message: "Cart not found", status: "error" });
        } else {
            // get menu
            const data_menu = await Menu.findOne({ _id: data_cart.id_menu });
            const data = {
                id: data_cart.id,
                id_user: data_cart.id_user,
                id_menu: data_cart.id_menu,
                quantity: data_cart.quantity,
                menu: {
                    id: data_menu._id,
                    id_tenant: data_menu.id_tenant,
                    nama_menu: data_menu.nama_menu,
                    harga_menu: data_menu.harga_menu,
                    photo: `http://127.0.0.1:5000/api/files/?filename=${data_menu.foto_menu}`,
                },
                total_harga: data_menu.harga_menu * data_cart.quantity,
            };
            return res.json({ data: data, status: "success" });
        }
    } else if (params.id_user) {
        if (!mongoose.Types.ObjectId.isValid(params.id_user)) {
            return res.json({
                message: "id_user invalid",
                status: "error",
            });
        }

        // cek user
        const data_user = await User.findOne({ _id: params.id_user });
        if (data_user === null) {
            return res.json({ message: "User not found", status: "error" });
        }

        // get cart
        const data_cart = await Cart.find({ id_user: data_user._id });

        let data_response = [];
        let grand_prize = 0;
        await Promise.all(
            data_cart.map(async (item) => {
                // get menu
                const query_menu = Menu.findOne({ _id: item.id_menu });
                const data_menu = await query_menu;
                const data = {
                    id: item.id,
                    id_user: item.id_user,
                    id_menu: item.id_menu,
                    quantity: item.quantity,
                    menu: {
                        id: data_menu._id,
                        id_tenant: data_menu.id_tenant,
                        nama_menu: data_menu.nama_menu,
                        harga_menu: data_menu.harga_menu,
                        photo: `http://127.0.0.1:5000/api/files/?filename=${data_menu.foto_menu}`,
                    },
                    total_harga: data_menu.harga_menu * item.quantity,
                };
                grand_prize += data_menu.harga_menu * item.quantity;
                data_response.push(data);
            })
        );
        const respon = {
            data_cart: data_response,
            grand_prize: grand_prize,
        };
        return res.json({
            data: respon,
            status: "success",
        });
    } else {
        // query all cart
        let data_cart = [];
        const query_cart = await Cart.find();
        await Promise.all(
            query_cart.map(async (item) => {
                // get menu
                const data_menu = await Menu.findOne({ _id: item.id_menu });
                const data = {
                    id: item.id,
                    id_user: item.id_user,
                    id_menu: item.id_menu,
                    quantity: item.quantity,
                    menu: {
                        id: data_menu._id,
                        id_tenant: data_menu.id_tenant,
                        nama_menu: data_menu.nama_menu,
                        harga_menu: data_menu.harga_menu,
                        photo: `http://127.0.0.1:5000/api/files/?filename=${data_menu.foto_menu}`,
                    },
                    total_harga: data_menu.harga_menu * item.quantity,
                };
                data_cart.push(data);
            })
        );
        return res.json({ data: data_cart, status: "success" });
    }
});

router.post("/cart/", async (req, res) => {
    const data = req.body;
    if (!data.id_user || !data.id_menu || !data.quantity) {
        return res.json({
            message: "Please fill id_user, id_menu, and quantity",
        });
    } else {
        const quantity = Number(data.quantity);
        if (!mongoose.Types.ObjectId.isValid(data.id_user)) {
            return res.json({
                message: "id_user invalid",
                status: "error",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(data.id_menu)) {
            return res.json({
                message: "id_menu invalid",
                status: "error",
            });
        }
        // query user and menu
        const query_user = User.findOne({ _id: data.id_user });
        const query_menu = Menu.findOne({ _id: data.id_menu });
        const [data_user, data_menu] = await Promise.all([
            query_user,
            query_menu,
        ]);
        // check user and menu if exists
        if (data_user === null) {
            return res.json({ message: "User not found", status: "error" });
        }
        if (data_menu === null) {
            return res.json({ message: "Menu not found", status: "error" });
        }
        // check quantity
        if (Number.isNaN(quantity) || quantity < 20) {
            return res.json({
                message: "Minimum quantity is 20",
                status: "error",
            });
        }
        // check if this user with this menu already in cart
        const query_cart = Cart.findOne({
            id_user: data_user._id,
            id_menu: data_menu._id,
        });
        const data_cart = await query_cart;
        if (data_cart === null) {
            // create new cart
            try {
                const new_cart = new Cart({
                    id_user: data_user._id,
                    id_menu: data_menu._id,
                    quantity: quantity,
                });
                const save_cart = await new_cart.save();
                return res.json({
                    message: "Item inserted in cart",
                    status: "success",
                });
            } catch (error) {
                console.log(error);
                return res.json({ message: "server Error", status: "error" });
            }
        } else {
            // Update cart
            try {
                const update_cart = await Cart.updateOne(
                    { _id: data_cart._id },
                    { $set: { quantity: data_cart.quantity + quantity } }
                );
                return res.json({
                    message: "Item inserted in cart",
                    status: "success",
                });
            } catch (error) {
                console.log(error);
                return res.json({ message: "server Error", status: "error" });
            }
        }
    }
});

router.put("/cart/", async (req, res) => {
    const data = req.body;
    if (!data.id_cart || !data.quantity) {
        return res.json({
            message: "Please fill id_cart and quantity",
            status: "error",
        });
    } else {
        if (!mongoose.Types.ObjectId.isValid(data.id_cart)) {
            return res.json({
                message: "id_cart invalid",
                status: "error",
            });
        }
        // check quantity
        const quantity = Number(data.quantity);
        if (Number.isNaN(quantity) || quantity < 20) {
            return res.json({
                message: "Minimum quantity is 20",
                status: "error",
            });
        }
        const data_cart = await Cart.findOne({ _id: params.id_cart });
        if (data_cart === null) {
            return res.json({ message: "Cart not found", status: "error" });
        } else {
            // update cart
            const update_cart = await Cart.updateOne(
                { _id: data_cart._id },
                { $set: { quantity: quantity } }
            );
            return res.json({ message: "Cart Updated", status: "success" });
        }
    }
});

router.delete("/cart/", async (req, res) => {
    // get query parameter
    const params = req.query;
    // check required parameter
    if (!params.id_cart) {
        return res.json({ message: "Please fill id_cart", status: "error" });
    }
    // check _id is valid
    if (!mongoose.Types.ObjectId.isValid(params.id_cart)) {
        return res.json({
            message: "id_cart invalid",
            status: "error",
        });
    }
    // query cart
    const data_cart = await Cart.findOne({ _id: params.id_cart });
    if (data_cart === null) {
        return res.json({ message: "Cart not found", status: "error" });
    } else {
        const remove_cart = await Cart.remove({ _id: data_cart._id });
        return res.json({ message: "Cart removed", status: "success" });
    }
});

module.exports = router;
