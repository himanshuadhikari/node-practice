module.exports = function (app, cluster) {
  app.use((req, res, next) => {
    console.log(`request came for url = ${req.url}`);
    console.log(`request is processed by = ${cluster.worker.id}`);
    next();
  });
};
