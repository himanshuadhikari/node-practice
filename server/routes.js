const landingPage = require("./api/landingPage");
const auth = require("./auth");

module.exports = function (app) {
  var appPath = app.get("appPath");

  // middleware to get user on every request
  app.use(async (req, res, next) => {
    const user = await auth.isAuthenticated(req);
    req.user = user || null;
    next();
  });

  // landing page
  app.route("/*").get(landingPage(appPath));
};
