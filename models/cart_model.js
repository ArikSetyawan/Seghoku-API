const mongoose = require("mongoose");

const cart_schema = mongoose.Schema({
    id_user: {
        type: String,
        required: true,
    },
    id_menu: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("cart", cart_schema);
