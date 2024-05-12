const mongoose = require("mongoose");
const User = require("./user.model");
const CommentSchema = require("./comment.model");


const ProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  index: {
    type: Number,
    required: true
  },
  diseasehash: {
    type: String,
    required: true
  },
  diseasename: {
    type: String,
    required: true
  },
  chunkid: {
    type: Number,
    required: true
  },
  chunkname: {
    type: String,
    required: false,
    default: null
  }, // proposer blockchain address
  proposer: {
    type: String,
    required: true
  }, // ipfs or other content hash
  raw_release_hash: {
    type: String,
    required: true
  },
  freefield: {
    type: String,
    required: false
  },
  commentsopen: {
    type: Boolean,
    required: true,
    default: false,
  },
  comments: [new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    proposalHash: {
      type: String,
      required: true,
      index: true,
      sparse: true
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    content: {
      type: String,
      required: true
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
   // replies: [this] 
  })] // Embedding comments within Proposal
});

const Proposal = mongoose.model("Proposal", ProposalSchema);

module.exports = Proposal;
