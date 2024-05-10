const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Proposal = require("../models/proposal.model");
const Reaction = require("../models/reaction.model");
const { DateTime } = require('luxon');
const mongoose = require("mongoose");

// Enum for reaction types to comments
const ReactionType = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote'
};


// middleware: auth.apiKeyAuth()
async function createCommentOnProposal(request, reply) {
  try {
    // Extract proposal ID from the request body or params, assuming it's passed in the request
    const { proposalHash } = request.body; // Adjust this according to how the proposal ID is passed
    
    // Find the proposal by its ID
    let proposal = await Proposal.findOne({ hash: proposalHash });
    
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    var newcomment = request.body.comment;
    //  request.user contains user thanks to auth.apiKeyAuth() middleware
    newcomment.user = request.user._id;
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
      if (parentComment.proposalHash != newcomment.proposalHash) {
        return reply.status(500).send("The provided Parent comment doesn't belong to this proposal.");
      }


      // Assign depth to the new comment
      newcomment.depth = parentComment.depth + 1;
      if(parentComment.depth == 0){
        newcomment.topComment = parentComment._id;
      }
      else {
        newcomment.topComment = parentComment.topComment;
      }

    }

    // Create a new comment based on the request body
    const comment = new Comment(newcomment);

    comment.user = await User.findOne({ _id: comment.user });
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


async function getProposalTopComments(request, reply) {
  try {

    // Extract the proposal ID from the request params
    const { id: proposalId } = request.params;

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


async function getProposalComments(request, reply) {
  try {
    
     // Extract the proposal hash from the request params
     const { proposalhash: proposalHash } = request.params;

    // Find the proposal by its ID and populate the comments field
    // add .lean() so that we can add new properties to comment
    const proposal = await Proposal.findOne({ hash: proposalHash }).populate('comments').lean();

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Extract comments from the proposal
    var proposalComments = proposal.comments;

    // Iterate through each comment and fetch its replies sequentially
    for(let onecomment of proposalComments) {
      onecomment.replies = await selectCommentRepliesMaxDepth(onecomment, 10);
      onecomment.user = await User.findOne({ _id: onecomment.user });
    }
    
    // Send the comments associated with the proposal in the response
    reply.send(proposalComments);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function selectCommentRepliesMaxDepth(_comment, _maxdepth){

  if (_maxdepth <= 0) {
    return [];
  }

  try {

    const comments = await Comment.find({ parentComment: _comment._id }).sort({ depth: 1 });
    let replies = [];
    for (let reply of comments) {
      reply.user = await User.findOne({ _id: reply.user });
      const childReplies = await selectCommentRepliesMaxDepth(reply, _maxdepth - 1);
      replies.push({ ...reply.toObject(), replies: childReplies });
    }

    return replies;
  } catch (error) {
    throw error;
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

    // check comment belongs to user

    
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


// Updates comment in Proposal.comment before updating comment
async function _updatecomment(comment) {
  try {

    // if comment is topLevel comment (comments without parent comment), also update Proposal.comment
    if(!comment.parentComment){

      var proposal = await Proposal.findOne({ hash: comment.proposalHash });

      // Update the Proposal's comments array if necessary
      const index = proposal.comments.findIndex(c => c._id.equals(comment._id));
      if (index !== -1) {
        proposal.comments[index] = comment; // Update content or any other properties you want to change
      }

      // Save the updated Proposal
      await proposal.save();

    }

      await comment.save();


  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}

// middleware: auth.apiKeyAuth()
async function upvoteOrDownvote(request, reply) {
  try {
    // Extract the data from the request body
    const { commentId, type } = request.body;

    //  request.user contains user thanks to auth.apiKeyAuth() middleware
    const user = request.user;

     // Find the comment by its ID
    let comment = await Comment.findById(commentId);

    if (!comment) {
      return reply.status(404).send("Comment not found");
    }

    if ((type !== ReactionType.UPVOTE && type !== ReactionType.DOWNVOTE)) {
      return reply.status(400).send("Reaction type not supported. Please chose upvote or downvote type");
    }
    

    // Find the reaction by user ID and post ID
    let reaction = await Reaction.findOne({ comment_id: comment._id, user_id: user._id });

    // If no reaction exists yet
    if (!reaction) {

      const now = DateTime.utc();
      // Create a new reaction
      reaction = new Reaction({ user_id: user._id, comment_id: comment._id, proposalHash: comment.proposalHash, type: type, createdAt: now.toJSDate()});
      await reaction.save();

        if (type == ReactionType.UPVOTE) {
          comment.upvotes += 1;
        } else if (type == ReactionType.DOWNVOTE) {
          comment.downvotes += 1;
        }

        await _updatecomment(comment);

    } else {
      // If reaction already exists, update it
      if (reaction.type == ReactionType.UPVOTE && type == ReactionType.DOWNVOTE) {
        reaction.type = ReactionType.DOWNVOTE;
        await reaction.save();
        comment.downvotes += 1;
        comment.upvotes -= 1;
        await _updatecomment(comment);
      } else if (reaction.type == ReactionType.DOWNVOTE && type == ReactionType.UPVOTE) {
        reaction.type = ReactionType.UPVOTE;
        await reaction.save();
        comment.upvotes += 1;
        comment.downvotes -= 1;
        await _updatecomment(comment);
      } else if (reaction.type == ReactionType.UPVOTE && type == ReactionType.UPVOTE) {
        await reaction.deleteOne();
        // should be unecessary to check upvotes >= 1 but added it anyway:
        if(comment.upvotes >= 1){
          comment.upvotes -= 1;
          await _updatecomment(comment);
        }
       
      } else if (reaction.type == ReactionType.DOWNVOTE && type == ReactionType.DOWNVOTE) {
        await reaction.deleteOne();
        if(comment.downvotes >= 1){
        comment.downvotes -= 1;
        await _updatecomment(comment);
        }
          
      }
    }

    const resp = {};
    resp.reaction = reaction;
    resp.comment = comment;
    const successResponse = {
      error: [],
      result: resp
    };
    return reply.send(successResponse);

  } catch (error) {
    // Return error response for any exceptions
    console.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}


module.exports = {
  createCommentOnProposal,
  getProposalTopComments,
  getProposalComments,
  getAllComments,
  updateComment,
  upvoteOrDownvote,
};
