const mongoose = require("mongoose");
const User = require("./user.model");

const AddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async function (v) {
          if (!v) return true; // Allow null or undefined values
          const user = await User.findById(v);
          return user !== null; // Check if user exists
      },
      message: (props) =>
          `User does not exist.`,
    }
  }
});

const Address = mongoose.model("Address", AddressSchema);

module.exports = Address;
