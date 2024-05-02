const proposalController = require("../controllers/proposal.controller");
const { basicAuth } = require("../middlewares/auth");

async function routes(fastify, options) {
  fastify.get("/proposals", proposalController.getProposals);
  fastify.get("/:proposalhash", proposalController.getProposal);
  fastify.get("/withcomments/:id", proposalController.getProposalComments);
  fastify.get("/comments/:proposalhash", proposalController.getProposalComments);
  fastify.post("/create", proposalController.createProposal);
}

module.exports = routes;
