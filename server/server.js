const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
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

  // cluster.on("listening", (worker, address) => {
  //   console.log(
  //     `listening == A worker is now connected to ${address.address}:${address.port}`
  //   );
  // });

  // cluster.on("online", (worker) => {
  //   console.log("online == Yay, the worker responded after it was forked");
  // });

  cluster.on("disconnect", (worker) => {
    console.log(`The worker #${worker.process.pid} has disconnected`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      "worker %d died (%s). restarting...",
      worker.process.pid,
      signal || code
    );
    // cluster.fork();
  });
} else {
  // Workers can share any TCP connection. In this case, it is an HTTP server.
  console.log("child process executed");
  http
    .createServer((req, res) => {
      console.log(
        "===========================request came to server==========================="
      );
      res.writeHead(200);
      res.end(`Current process\n ${process.pid}`);
      console.log(
        "===========================request finished from server==========================="
      );
      // process.kill(process.pid);
    })
    .listen(8000);
}
