const commentController = require("../controllers/comment.controller");
const { apiKeyAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/comments", commentController.getAllComments);
  fastify.get("/topcomments/proposal/:proposalhash", commentController.getProposalTopComments);
  fastify.get("/comments/page/proposal/:proposalhash", commentController.getProposalComments);
  fastify.put("/:id", { preHandler: apiKeyAuth }, commentController.updateComment);
  fastify.post("/create", { preHandler: apiKeyAuth }, commentController.createCommentOnProposal);
  fastify.post("/newreaction", { preHandler: apiKeyAuth }, commentController.upvoteOrDownvote);
}

module.exports = routes;