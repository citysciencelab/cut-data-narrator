const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    routes = require("./routes/routes"),
    cors = require("cors"),
    app = express();


app.use(cors({
    origin: "*"
}));
app.use(express.json({limit: "25mb"}));
app.use(bodyParser.json());
app.use("/", routes);
app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
});
