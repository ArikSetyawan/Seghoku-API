const mongoose = require("mongoose");

const checkout_schema = mongoose.Schema({
    id_user: {
        type: String,
        required: true,
    },
    transaction_number: {
        type: String,
        required: true,
        unique: true,
    },
    transaction_date: {
        type: String,
        required: true,
    },
    transaction_epoch: {
        type: Number,
        required: true,
    },
    transaction_status: {
        type: String,
        default: "Payment",
    },
    va: {
        type: Number,
        required: true,
        unique: true,
    },
    payment_status: {
        type: Boolean,
        default: false,
    },
    item: {
        type: Array,
        required: true,
    },
});
module.exports = mongoose.model("checkout", checkout_schema);
