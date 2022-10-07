const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");
const momenttz = require("moment-timezone");
require("dotenv").config();
const base_url = process.env.BASE_URL;

// Import Model
const Cart = require("../models/cart_model");
const User = require("../models/user_model");
const Menu = require("../models/menu_model");
const Checkout = require("../models/checkout_model");

// URL Payment Gateway
const url_payment = process.env.PAYMENT_URL;

// Token Payment Gateway
const token_payment = process.env.PAYMENT_TOKEN;

router.get("/checkout/", async (req, res) => {
    const params = req.query;
    const jumlah_params = Object.keys(params).length;
    if (jumlah_params > 1) {
        return res.json({message:"To many parameter", status:"error"})
    } else if (params.transaction_number) {
        // Cek transaksi
        const query_checkout = await Checkout.findOne({transaction_number:params.transaction_number})
        if (query_checkout === null){
            return res.json({message:"Transaction not found", status:"error"})
        }

        // get user 
        const query_user = await User.findOne({_id:query_checkout.id_user})
        const user = {
            id:query_user._id,
            nama:query_user.nama
        }

        // get menu item
        let list_menu = []
        
        await Promise.all(
            query_checkout.item.map(async (item) => {
                const querymenu = await Menu.findOne({_id:item})
                const data_menu = {
                    id: querymenu._id,
                    id_tenant: querymenu.id_tenant,
                    nama_menu: querymenu.nama_menu,
                    harga_menu: querymenu.harga_menu,
                    foto_menu: `${base_url}/api/files/?filename=${querymenu.foto_menu}`,
                }
                list_menu.push(data_menu)
            })
        )
        const data = {
            user: user,
            id : query_checkout._id,
            transaction_number: query_checkout.transaction_number,
            transaction_date: query_checkout.transaction_date,
            transaction_epoch: query_checkout.transaction_epoch,
            transaction_status: query_checkout.transaction_status,
            va: query_checkout.va,
            payment_status: query_checkout.payment_status,
            item : list_menu
        }
        return res.json({data:data,status:"success"})
    } else if (params.id_user) {
        // Check if id_user is valid
        if (!mongoose.Types.ObjectId.isValid(params.id_user)) {
            return res.json({
                message: "id_user invalid",
                status: "error",
            });
        }

        // cek user if exist
        const query_user = await User.findOne({_id:params.id_user})
        if (query_user === null){
            return res.json({message:"User not found.", status:"error"})
        } else {
            const user = {
                id : query_user._id,
                nama : query_user.nama
            }
            // get transaksi
            // Resolve Transaksi
            function resolve_transaksi(transaksi,data_user){
                return Promise.all(transaksi.map(async item => {
                    let list_menu = await resolve_menu(item.item)
                    const data = {
                        user: data_user,
                        id : item._id,
                        transaction_number: item.transaction_number,
                        transaction_date: item.transaction_date,
                        transaction_epoch: item.transaction_epoch,
                        transaction_status: item.transaction_status,
                        va: item.va,
                        payment_status: item.payment_status,
                        item : list_menu
                    }
                    return data
                }))
            }
            // Resolve Menu
            async function resolve_menu(item){
                let list_item = []
                await Promise.all(item.map(async i =>{
                    const querymenu = await Menu.findOne({_id:i})
                    const data_menu = {
                        id: querymenu._id,
                        id_tenant: querymenu.id_tenant,
                        nama_menu: querymenu.nama_menu,
                        harga_menu: querymenu.harga_menu,
                        foto_menu: `${base_url}/api/files/?filename=${querymenu.foto_menu}`,
                    }
                    list_item.push(data_menu)
                }))
                return list_item
            }
            
            const query_checkout = await Checkout.find({id_user:query_user._id})
            let d_transaksi = await resolve_transaksi(query_checkout,user)
            return res.json({data:d_transaksi,message:"oke"})
        }
    } else{
        let data_transaksi = []
        const query_checkout = await Checkout.find()
        await Promise.all(query_checkout.map(async item =>{
            // get user 
            const query_user = await User.findOne({_id:item.id_user})
            let user
            if (query_user === null) {
                user = {
                    id:'',
                    nama:''
                }
            } else {
                user = {
                    id:query_user._id,
                    nama:query_user.nama
                }
            }
            
            // get list menu
            let list_menu = []
            await Promise.all(item.item.map(async i => {
                const querymenu = await Menu.findOne({_id:i})
                const data_menu = {
                    id: querymenu._id,
                    id_tenant: querymenu.id_tenant,
                    nama_menu: querymenu.nama_menu,
                    harga_menu: querymenu.harga_menu,
                    foto_menu: `${base_url}/api/files/?filename=${querymenu.foto_menu}`,
                }
                list_menu.push(data_menu)
            }))
            const data = {
                user: user,
                id : item._id,
                transaction_number: item.transaction_number,
                transaction_date: item.transaction_date,
                transaction_epoch: item.transaction_epoch,
                transaction_status: item.transaction_status,
                va: item.va,
                payment_status: item.payment_status,
                item : list_menu
            }
            data_transaksi.push(data)
        }))
        return res.json({data:data_transaksi, status:"success"})
    }
});

router.post("/checkout/", async (req, res) => {
    const now = Date.now();
    // get data from body
    const data = req.body;
    // check required data
    if (!data.id_user) {
        return res.json({ message: "Please fill id_user", status: "error" });
    }
    // check if id_user is valid
    if (!mongoose.Types.ObjectId.isValid(data.id_user)) {
        return res.json({ message: "id_user invalid", status: "error" });
    }
    // check if user is exist
    const queryuser = User.findOne({ _id: data.id_user });
    const querycart = Cart.find({ id_user: data.id_user });
    const user = await queryuser;
    if (user === null) {
        return res.json({ message: "User not found", status: "error" });
    }
    // check available cart
    const cart = await querycart;
    if (cart.length === 0) {
        return res.json({ message: "Cart Empty", status: "error" });
    }
    // list menu in cart
    let list_menu = [];
    // calculate amount
    let amount = 0;
    await Promise.all(
        cart.map(async (item) => {
            // get menu
            const menu = await Menu.findOne({ _id: item.id_menu });
            amount += menu.harga_menu * item.quantity;
            list_menu.push(item.id_menu);
        })
    );

    // generate trx_id
    const transaction_number = `TRX${
        Math.floor(Math.random() * (900000 - 100000 + 1)) + 100000
    }`;
    // set data and header for getting va
    const json_data = {
        transaction_id: transaction_number,
        payment_method: "bni",
        amount: amount,
        customer_name: user.nama,
    };

    const header = {
        token: token_payment,
    };

    try {
        // make call to payment gateway to get va
        let request_va = await axios({
            method: "post",
            url: url_payment,
            headers: header,
            data: json_data,
        });
        request_va = request_va.data;
        if (request_va.status === "success") {
            // insert into checkout
            const newCheckout = new Checkout({
                id_user: user._id,
                transaction_number: transaction_number,
                transaction_date: momenttz(now)
                    .tz("Asia/Jakarta")
                    .format("YYYY-MM-DD HH:mm:ss"),
                transaction_epoch: now,
                va: request_va.va,
                item: list_menu,
            });
            const savecheckout = await newCheckout.save();
            // remove item from cart
            const delete_cart = await Cart.deleteOne({ id_user: user._id });
            return res.json({
                data: {
                    va: request_va.va,
                    transaction_number: transaction_number,
                },
                status: "success",
            });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "server error", status: "error" });
    }
});

module.exports = router;
