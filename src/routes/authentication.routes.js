const authenticationController = require("../controllers/authentication.controller");

async function routes(fastify, options) {
  fastify.post("/register", authenticationController.register);
}

module.exports = routes;
