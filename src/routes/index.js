
const express = require("express");
const router = express.Router();
const controller = require("../controller/app");

let routes = (app) => {
  router.post("/api/login", controller.login); 
  router.post("/api/register", controller.register);
  router.post("/api/submitkey", controller.authenticateJWT, controller.submitkey);
  router.get("/api/verify/:id/:token", controller.verifyemail);
  app.use(router);

};

module.exports = routes;