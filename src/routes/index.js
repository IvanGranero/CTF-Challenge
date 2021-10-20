
const express = require("express");
const router = express.Router();
const controller = require("../controller/app");

let routes = (app) => {
  router.post("/login", controller.login);
  router.get("/logout", controller.logout);   
  router.post("/register", controller.register);
  router.post("/upload", controller.upload);
  router.get("/files", controller.files);
  router.get("/files/:name", controller.download);

  app.use(router);

};

module.exports = routes;