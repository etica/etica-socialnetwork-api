const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Address = require("./address.model");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  mainaddress: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  comments_status: {
    type: String,
    enum: ["Open", "Suspended", "Baned"],
    default: "Open",
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (error) {
    console.log(error)
    throw error;
  }
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
