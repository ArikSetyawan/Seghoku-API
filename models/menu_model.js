const mongoose = require("mongoose");

const menu_schema = mongoose.Schema({
    id_tenant: {
        type: String,
        required: true,
    },
    nama_menu: {
        type: String,
        required: true,
    },
    harga_menu: {
        type: Number,
        required: true,
    },
    foto_menu: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("menu", menu_schema);
