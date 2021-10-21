
const express = require("express");
const router = express.Router();
const controller = require("../controller/app");

let routes = (app) => {
  router.post("/api/login", controller.login); 
  router.post("/api/register", controller.register);
  router.post("/api/upload", controller.upload);
  router.get("/api/files", controller.files);
  router.get("/api/files/:name", controller.download);

  app.use(router);

};

module.exports = routes;