const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;
const express = require("express");
const routes = require("./routes.js");
const config = require("./config/environment");

if (cluster.isMaster) {
  createChildProcess();
} else {
  const app = express();
  createServer(app);
}

function createServer(app) {
  routes(app);
  http.createServer(app).listen(config.port, config.ip, function () {
    console.info(
      "APP: Server cluster :%d listening on %d, in %s mode",
      cluster.isWorker ? cluster.worker.id : 1,
      config.port,
      app.get("env")
    );
  });
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
