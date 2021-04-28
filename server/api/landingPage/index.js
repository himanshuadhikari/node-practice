const path = require("path");
const MAX_AGE = 21600000; //ms

module.exports = function (appPath) {
  return function (req, res, next) {
    const landingPageURl = req.user ? "/index.html" : "/Login/login.html";
    const fileName = path.resolve(appPath + landingPageURl);
    res.sendFile(
      fileName,
      (options = {
        maxAge: MAX_AGE,
      })
    );
  };
};
