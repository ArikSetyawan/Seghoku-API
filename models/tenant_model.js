const mongoose = require("mongoose");

const tenant_schema = mongoose.Schema({
    id_user: {
        type: String,
        require: true,
        unique: true,
    },
    id_location: {
        type: String,
        require: true,
    },
    nama_toko: {
        type: String,
        require: true,
        unique: true,
    },
    no_hp: {
        type: String,
        require: true,
        unique: true,
    },
});

module.exports = mongoose.model("tenant", tenant_schema);
