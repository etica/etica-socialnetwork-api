const mongoose = require("mongoose");
const User = require("./user.model");

const ReactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },
  proposalHash: {
    type: String,
    ref: "Proposal",
    default: null,
    index: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ["upvote", "downvote"],
    default: "upvote",
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reaction = mongoose.model("Reaction", ReactionSchema);

module.exports = Reaction;
