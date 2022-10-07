const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const momenttz = require("moment-timezone");
const port = process.env.PORT || 5000;
const upload = require("express-fileupload");
require("dotenv").config();

// Define Apps
const app = express();

// DB
// DB Atlas
const db_url = process.env.DB_URL

// DB Local
// const db_url = "mongodb://localhost:27017/Seghoku";

mongoose.connect(
    db_url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("db connected")
);

const now = momenttz(Date.now())
    .tz("Asia/Jakarta")
    .format("YYYY-MM-DD HH:mm:ss");

// Custom Function
const logger = (req, res, next) => {
    console.log(
        `=> ${momenttz(Date.now())
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss")} ${req.originalUrl} - ${
            req.method
        } --`
    );
    next();
};

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(upload({ limit: { fileSize: 2 * 1024 * 1024 } })); //2MB
app.use(logger);

// import router
const level_user_router = require("./routes/level_user_route.js");
const user_router = require("./routes/user_route.js");
const location_router = require("./routes/location_route.js");
const tenant_router = require("./routes/tenant_route.js");
const menu_router = require("./routes/menu_route.js");
const files_router = require("./routes/files_route.js");
const login_router = require("./routes/login_route.js");
const cart_router = require("./routes/cart_route.js");
const checkout_router = require("./routes/checkout_route.js");

// route
app.use("/api", level_user_router);
app.use("/api", user_router);
app.use("/api", location_router);
app.use("/api", tenant_router);
app.use("/api", menu_router);
app.use("/api", files_router);
app.use("/api", login_router);
app.use("/api", cart_router);
app.use("/api", checkout_router);

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});
