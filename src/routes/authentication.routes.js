const authenticationController = require("../controllers/authentication.controller");

async function routes(fastify, options) {
  fastify.get("/challenge/general", authenticationController.getChallengeGeneral);
  fastify.post("/register", authenticationController.register);

  fastify.get("/challenge/user/:userAddress", authenticationController.getChallengeUser);
  fastify.post("/login", authenticationController.login);
}

module.exports = routes;
