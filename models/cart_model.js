const mongoose = require("mongoose");

const cart_schema = mongoose.Schema({
    id_user: {
        type: String,
        require: true,
    },
    id_menu: {
        type: String,
        require: true,
    },
    quantity: {
        type: Number,
        require: true,
    },
});

module.exports = mongoose.model("cart", cart_schema);
