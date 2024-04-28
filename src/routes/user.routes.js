const userController = require("../controllers/user.controller");
const { basicAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/users", userController.getAllUsers);
  fastify.get("/:id", userController.getUserById);
  //fastify.post("/", { preHandler: basicAuth }, userController.createUser);
  fastify.post("/create", userController.createUser);
  fastify.post("/ban/:id", userController.banUser);
  fastify.put("/update/:id", userController.updateUser);
}

module.exports = routes;
