const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment = require("moment");

// Define Apps
const app = express();

// DB
const db_url =
    "mongodb+srv://ariksetyawan:minuman1234@cluster0.xfhcs.mongodb.net/Seghoku?retryWrites=true&w=majority";
mongoose.connect(
    db_url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("db connected")
);

// Custom Function
const logger = (req, res, next) => {
    console.log(
        `=> ${moment().format()} ${req.originalUrl} - ${req.method} --`
    );
    next();
};

// Middleware
app.use(express.json());
app.use(logger);

// import router

// route

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`);
});
