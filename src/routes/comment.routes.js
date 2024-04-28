const commentController = require("../controllers/comment.controller");
const { basicAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/allcomments", commentController.getAllComments);
  fastify.post("/create", commentController.createCommentOnProposal);
  fastify.get("/proposal/:id", commentController.getProposalComments);
  fastify.put("/:id", commentController.updateComment);
}

module.exports = routes;