const User = require("../models/user.model");
const Proposal = require("../models/proposal.model");
const Reaction = require("../models/reaction.model");
const { DateTime } = require('luxon');
const mongoose = require("mongoose");

// Enum for reaction types to comments
const ReactionType = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote'
};


async function getAllUsers(request, reply) {
  try {
    const users = await User.find();
    reply.send(users);
  } catch (error) {
    console.log('getallUsers error: ', error);
    reply.status(500).send(error);
  }
}
async function getUserById(request, reply) {
  try {
    const user = await User.findById(request.params.id);
    reply.send(user);
  } catch (error) {
    reply.status(500).send(error);
  }
}
async function createUser(request, reply) {
  try {
    const user = new User(request.body);
    const result = await user.save();
    reply.send(result);
  } catch (error) {
    reply.status(500).send(error);
  }
}
async function updateUser(request, reply) {
  try {
    const user = await User.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
    });
    reply.send(user);
  } catch (error) {
    reply.status(500).send(error);
  }
}

async function banUser(request, reply) {
  try {
    const user = await User.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
    });
    reply.send(user);
  } catch (error) {
    reply.status(500).send(error);
  }
}

/*
async function deleteUser(request, reply) {
  try {
    await User.findByIdAndDelete(request.params.id);
    reply.status(204).send("");
  } catch (error) {
    reply.status(500).send(error);
  }
} */

// AUTH USER

async function getAuthUser(request, reply) {
  try {

    //request.user contains user thanks to auth.apiKeyAuth() middleware
    const user = request.user;
    const successResponse = {
      success: true,
      user: user
    };
    return reply.send(successResponse);

  } catch (error) {
    const errorResponse = {
      success: false,
      error: error
    };
    reply.status(500).send(errorResponse);
  }
}


// middleware: auth.apiKeyAuth()
async function getProposalReactions(request, reply) {
  try {
    
     // Extract the proposal hash from the request params
     const { proposalhash: proposalHash } = request.params;

    // Find the proposal by its ID and populate the comments field
    // add .lean() so that we can add new properties to comment
    const proposal = await Proposal.findOne({ hash: proposalHash });

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Usefull to show upvotes/downvotes in bold if user made an upvote or downvote
    var proposalReactions = await Reaction.find({ user_id: request.user._id, proposalHash: proposal.hash });

    const successResponse = {
      result: proposalReactions
    };
    return reply.send(successResponse);
    
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    const errorResponse = {
      error: error
    };
    reply.status(500).send(errorResponse);
  }
}

// AUTH USER

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  banUser,
  getAuthUser,
  getProposalReactions,
};
