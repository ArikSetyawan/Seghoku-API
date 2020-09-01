const mongoose = require("mongoose");

const menu_schema = mongoose.Schema({
    id_tenant: {
        type: String,
        require: true,
    },
    nama_menu: {
        type: String,
        require: true,
    },
    harga_menu: {
        type: Number,
        require: true,
    },
    foto_menu: {
        type: String,
        require: true,
        unique: true,
    },
});

module.exports = mongoose.model("menu", menu_schema);
