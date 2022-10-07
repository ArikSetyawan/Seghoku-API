const mongo = require("mongoose");

const user_schema = mongo.Schema({
    id_level: {
        type: String,
        required: true,
    },
    nama: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongo.model("user", user_schema);
