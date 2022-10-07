const mongoose = require("mongoose");

const tenant_schema = mongoose.Schema({
    id_user: {
        type: String,
        required: true,
        unique: true,
    },
    id_location: {
        type: String,
        required: true,
    },
    nama_toko: {
        type: String,
        required: true,
        unique: true,
    },
    no_hp: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("tenant", tenant_schema);
