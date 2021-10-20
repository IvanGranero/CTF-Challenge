const cors = require("cors");
const express = require("express");
const session = require('express-session');
const initRoutes = require("./src/routes");
const ExpressError = require('./src/utils/ExpressError');
const app = express();

global.__basedir = __dirname;

/*
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
*/

app.use(express.urlencoded({ extended: true }));

app.use(session({ 
  secret: 'baEBVewJmeJ34vGW',
  resave: false,
  saveUninitialized: true,
}));

app.use((err, req, res, next) => {
  const { status = 500, message = 'Error' } = err;
  res.status(status).send(message);
});

initRoutes(app);

let port = 4300;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});