const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;
const express = require("express");
// const routes = require("./routes.js");
const config = require("./config/environment");
const path = require("path");
const MAX_AGE = 21600000; //ms
const logger = require("./logger");

if (cluster.isMaster) {
  createChildProcess();
} else {
  const app = express();
  setConfig(app);
  logger(app, cluster);
  setHomePage(app);
  createServer(app);
}

function createServer(app) {
  http.createServer(app).listen(config.port, config.ip, function () {
    console.info(
      "APP: Server cluster :%d listening on %d, in %s mode",
      cluster.isWorker ? cluster.worker.id : 1,
      config.port,
      app.get("env")
    );
  });
}

function setHomePage(app) {
  // All other routes should redirect to the index.html
  var appPath = app.get("appPath");
  app.route("/*").get(function (req, res, next) {
    const fileName = path.resolve(appPath + "/index.html");
    res.sendFile(
      fileName,
      (options = {
        maxAge: MAX_AGE,
      })
    );
  });
}

function setConfig(app) {
  // configuring app path
  app.set("appPath", "client");
  app.locals.appPath = "client";
  //   setting static html files
  app.set("views", config.root + "/server/views");
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");
}

function createChildProcess() {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("fork", (worker) => {
    console.log(
      `fork == new child process created with id = ${worker.process.pid}`
    );
  });

  cluster.on("disconnect", (worker) => {
    console.log(`The worker #${worker.process.pid} has disconnected`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log("worker %d died (%s)", worker.process.pid, signal || code);
    // cluster.fork();
  });
}
