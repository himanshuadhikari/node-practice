"use strict";

var path = require("path");
var environment = process.env.NODE_ENV || "development";

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error("You must set the " + name + " environment variable");
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + "/../../.."),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: true,

  // Secret for session, you will want to change this and make it an environment variable

  // List of user roles
  userRoles: ["GUEST", "USER", "ADMIN"],
  secrets: {
    session: "chanters-secret",
    sessionTimeMillis: process.env.SESSION_TIMEOUT || 2592000000, //DEFAULT: 30 days
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true,
      },
    },
  },
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = Object.assign(all, require("./" + environment + ".js") || {});
