const express = require("express");
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
const level_user_router = require("./routes/level_user_route.js");
const user_router = require("./routes/user_route.js");
const location_router = require("./routes/location_route.js");

// route
app.use("/api", level_user_router);
app.use("/api", user_router);
app.use("/api", location_router);

app.listen(5000, () => {
    console.log(`app listening at http://localhost:5000`);
});
