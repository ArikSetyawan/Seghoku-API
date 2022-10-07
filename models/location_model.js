const mongoose = require("mongoose");

const location_schema = mongoose.Schema({
    nama_location: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("location", location_schema);
