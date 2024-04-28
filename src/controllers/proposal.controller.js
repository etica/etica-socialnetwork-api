const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Proposal = require("../models/proposal.model");


async function createProposal(request, reply) {
  try {

    // Extract proposal ID from the request body or params, assuming it's passed in the request
    const reqproposal = request.body; // Adjust this according to how the proposal ID is passed

    if (!reqproposal || !reqproposal.hash) {
      return reply.status(404).send("Wrong request format, please check API documentation to find expected request format");
    }
    
    // Find the proposal by its ID
    const exist_proposal = await Proposal.findOne({ hash: reqproposal.hash });
    if (exist_proposal) {
      return reply.status(404).send("This Proposal is already added to database");
    }

    const proposal = new Proposal(request.body);
    const result = await proposal.save();
    reply.send(result);
  } catch (error) {
    reply.status(500).send(error);
  }
}


async function getProposal(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Send the comments associated with the proposal in the response
    reply.send(proposal);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function getProposalComments(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Extract comments from the proposal
    const proposalComments = proposal.comments;

    // Send the comments associated with the proposal in the response
    reply.send(proposalComments);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function getProposalWithComments(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Send the comments associated with the proposal in the response
    reply.send(proposal);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function getProposals(request, reply) {
  try {
    const proposals = await Proposal.find();
    reply.send(proposals);
  } catch (error) {
    reply.status(500).send(error);
  }
}



module.exports = {
  createProposal,
  getProposal,
  getProposals,
  getProposalComments,
  getProposalWithComments,
};
