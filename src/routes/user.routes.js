const userController = require("../controllers/user.controller");
const { apiKeyAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/users", userController.getAllUsers);
  fastify.get("/:id", userController.getUserById);
  fastify.post("/create", userController.createUser);
  fastify.post("/ban/:id", userController.banUser);

  fastify.get("/authuser", { preHandler: apiKeyAuth }, userController.getAuthUser);
  fastify.put("/update/:id", { preHandler: apiKeyAuth }, userController.updateUser);

  fastify.get("/reactions/proposal/:proposalhash", { preHandler: apiKeyAuth }, userController.getProposalReactions);
}

module.exports = routes;
