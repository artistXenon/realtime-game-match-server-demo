const express = require("express");

const routes = require("./routes");

const app = express();

app.get('/', (req, res) => {
    res.send("foo");
});

exports.main = app;
