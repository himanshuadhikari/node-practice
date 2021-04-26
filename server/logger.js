module.exports = function (app, cluster) {
  app.use((req, res, next) => {
    console.log(`Current process ${process.pid}`);
    next();
  });
};
