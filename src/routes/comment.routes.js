const commentController = require("../controllers/comment.controller");
const { basicAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/comments", commentController.getAllComments);
  fastify.post("/create", commentController.createCommentOnProposal);
  fastify.get("/topcomments/proposal/:id", commentController.getProposalTopComments);
  fastify.get("/comments/page/proposal/:id", commentController.getProposalComments);
  fastify.put("/:id", commentController.updateComment);
}

module.exports = routes;