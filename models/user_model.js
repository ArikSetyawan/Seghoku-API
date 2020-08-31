const mongo = require("mongoose");

const user_schema = mongo.Schema({
    id_level: {
        type: String,
        require: true,
    },
    nama: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
});

module.exports = mongo.model("user", user_schema);
