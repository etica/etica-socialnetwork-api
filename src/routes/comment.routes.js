const commentController = require("../controllers/comment.controller");
const { basicAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/comments", commentController.getAllComments);
  fastify.post("/create", commentController.createCommentOnProposal);
  fastify.get("/topcomments/proposal/:proposalhash", commentController.getProposalTopComments);
  fastify.get("/comments/page/proposal/:proposalhash", commentController.getProposalComments);
  fastify.put("/:id", commentController.updateComment);
  fastify.post("/newreaction", commentController.upvoteOrDownvote);
}

module.exports = routes;