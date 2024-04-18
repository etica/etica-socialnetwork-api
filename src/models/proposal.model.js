const mongoose = require("mongoose");
const User = require("./user.model");
const Comment = require("./comment.model");


const ProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  hash: {
    type: String,
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
    type: String,
    required: true
  },
  chunkname: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  content: {
    type: String,
    required: true
  }, // Admin can close comments on proposal
  commentsopen: {
    type: Boolean,
    required: true,
    default: false,
  },
  comments: [CommentSchema] // Embedding comments within Proposal
});

const Proposal = mongoose.model("Proposal", ProposalSchema);

module.exports = Comment;
