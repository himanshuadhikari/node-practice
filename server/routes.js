var path = require("path");
var MAX_AGE = 21600000; //ms
var config = require("./config/environment");

module.exports = function (app) {
  // configuring app path
  app.set("appPath", "client");
  app.locals.appPath = "client";

  //   setting static html files
  app.set("views", config.root + "/server/views");
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");
  var appPath = app.get("appPath");

  // All other routes should redirect to the index.html
  app.route("/*").get(function (req, res, next) {
    _sendFile(res, appPath + "/index.html");
  });

  function _sendFile(res, fileName, options, cb) {
    fileName = path.resolve(fileName);
    if (arguments.length < 2) {
      throw "Too less argument as expected";
    }
    if ("function" == typeof options) {
      cb = options;
      options = undefined;
    }
    if (typeof options === "undefined") {
      options = {
        maxAge: MAX_AGE,
      };
    }
    if (typeof cb !== "function") {
      cb = function (error) {
        if (error) {
          console.log("SEND FILE ERROR:", error);
          return res.status(error.status).end();
        }
      };
    }
    return res.sendFile(fileName, options, cb);
  }
};
