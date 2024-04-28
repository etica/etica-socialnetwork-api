const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Proposal = require("../models/proposal.model");
const { DateTime } = require('luxon');
const mongoose = require("mongoose");


async function createCommentOnProposal(request, reply) {
  try {
    // Extract proposal ID from the request body or params, assuming it's passed in the request
    const { proposalId } = request.body; // Adjust this according to how the proposal ID is passed
    
    // Find the proposal by its ID
    let proposal = await Proposal.findById(proposalId);
    
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    var newcomment = request.body.comment;
    
    newcomment.proposalHash = proposal.hash;
    // Get the current date and time in UTC using Luxon
    const now = DateTime.utc();
    // Assign the formatted UTC date to the createdAt field of newcomment
    newcomment.createdAt = now.toJSDate();

    // Ensure that the new comment has a unique identifier
    newcomment._id = new mongoose.Types.ObjectId();
    newcomment.depth = 0;

    if (newcomment.parentComment) {
      const parentComment = await Comment.findById(newcomment.parentComment);
      if (!parentComment) {
        return reply.status(404).send("Parent comment not found");
      }

      // Assign depth to the new comment
      newcomment.depth = parentComment.depth + 1;
      newcomment.topComment = parentComment.topComment;
    }

    // Create a new comment based on the request body
    const comment = new Comment(newcomment);
    const result = await comment.save();
    reply.send(result);

    if (!comment.parentComment) {
      comment.depth = 0;
      // If the comment does not have a parent comment ID, add it to the top-level comments array
      proposal.comments.push(comment);
      // Save the updated proposal with the new comment
      await proposal.save();
    }
    
    // Send the updated proposal object in the response
    reply.send(comment);
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
    const proposal = await Proposal.findById(proposalId).populate('comments');

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


async function getAllComments(request, reply) {
  try {
    // Find all proposals and populate the comments field
    const proposalsWithComments = await Proposal.find({}).populate('comments');

    // Extract all comments from the proposals
    const allComments = proposalsWithComments.reduce((acc, proposal) => {
      acc.push(...proposal.comments);
      return acc;
    }, []);

    // Send all comments in the response
    reply.send(allComments);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function updateComment(request, reply) {
  try {
    // Extract the comment ID from the request params or body
    const { commentId } = request.params; // Assuming the comment ID is in the URL params
    // You can also use request.body.commentId if it's passed in the request body
    
    // Find the comment by its ID
    let comment = await Comment.findById(commentId);
    
    // If the comment doesn't exist, return a 404 status
    if (!comment) {
      return reply.status(404).send("Comment not found");
    }
    
    // Update the comment content with the new content from the request body
    comment.content = request.body.content;
    
    // Save the updated comment
    const updatedComment = await comment.save();
    
    // Send the updated comment in the response
    reply.send(updatedComment);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


module.exports = {
  createCommentOnProposal,
  getProposalComments,
  getAllComments,
  updateComment,
};
