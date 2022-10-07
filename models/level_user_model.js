const mongo = require("mongoose");

const level_user_schema = mongo.Schema({
    nama_level: {
        type: String,
        unique: true,
        required: true,
    },
});

module.exports = mongo.model("level_user", level_user_schema);
