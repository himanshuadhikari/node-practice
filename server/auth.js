const jsonwebtoken = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("./config/environment");
const validateJwtToken = expressJwt({
  secret: config.secrets.session,
  algorithms: ["RS256"],
});

async function isAuthenticated(req, res, next) {
  try {
    const token = normalizeToken("token", req.headers.cookie) || "";
    const data = validateJwt(token);
    console.log("data>>>>>>>>>", data)
  } catch (error) {
    return null;
  }
}

function validateJwt(token) {
  try {
    return jsonwebtoken.verify(token, config.secrets.session);
  } catch (error) {
    return null;
  }
}

function normalizeToken(name, cookie) {
  var b = cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

exports.isAuthenticated = isAuthenticated;

//   return (
//     compose()
//       .use(normalizeToken)
//       // Validate jwt
//       .use(function (req, res, next) {
//         validateJwt(req, res, next);
//       })
//       // Attach user to request
//       .use(function (req, res, next) {
//         User.findOne(
//           { _id: req.user._id },
//           projection,
//           { lean: true },
//           function (err, user) {
//             if (err) return next(err);
//             if (!user) return res.status(401).send();
//             user.hasRole = hasUserRole;
//             req.user = user;
//             next();
//           }
//         );
//       })
//   );
