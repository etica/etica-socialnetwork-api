const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key'; // Replace this with your secret key
const SignatureService = require('../services/SignatureService');
const ethUtil = require ('ethereumjs-util');
const web3validator = require('web3-validator');
const { Web3 } = require('web3');
const web3 = new Web3();
const { DateTime } = require('luxon');

const User = require("../models/user.model");


// Function to generate a JWT token with an expiration time
function generateToken(payload) {
  // Set expiration time to 1 hour from now (in seconds)
  const expiresIn = 3600; // 1 hour
  return jwt.sign(payload, secretKey, { expiresIn });
}

// Example payload (user information)
const user = {
  id: 123,
  username: 'example_user'
};

// Generate a JWT token with the user payload
const token = generateToken(user);
console.log('Generated JWT token:', token);

// Function to verify and decode a JWT token
function verifyToken(token) {
  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded JWT payload:', decoded);
    return decoded;
  } catch (error) {
    // Handle token verification errors (e.g., expired token)
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Verify and decode the generated token
const decodedToken = verifyToken(token);
if (decodedToken) {
  // Token is valid, perform further actions based on the decoded payload
  console.log('User ID:', decodedToken.id);
  console.log('Username:', decodedToken.username);
}


  async function register(request, reply){

    try {

      // Check if required data is present in the request
      const { authAddress, authSignature, authChallenge } = request.body;
      if (!authAddress || !authSignature || !authChallenge) {
        const errorResponse = {
          error: ['Required data is missing in the request. Please check API documentation to pass data correctly.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Validate the authChallenge
      const challengeMessage = '0x27fe5fcaeacf7df0889a53a0ef6e59117351604cc9c792ecd768f6b4e2dab64b';
      if (authChallenge !== challengeMessage) {
        const errorResponse = {
          error: ['Wrong AuthChallenge. Please check API documentation to pass data correctly. Use route /auth/challenge to get auth Challenge.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Validate the authAddress format
      if (!web3validator.isAddress(authAddress)) {
        const errorResponse = {
          error: ['Invalid authAddress. Please check address format.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Verify signature for new user
      const signatureNewUser = await verifySignatureForNewUser(authAddress, authSignature, authChallenge, reply);
      if (signatureNewUser !== 'SUCCESS') {
        const errorResponse = {
          error: ['Failed to register new user with this address and this signature.']
        };
        return reply.status(400).send(errorResponse);
      }

       // Verify the signature
       const signatureService = new SignatureService();

       const now = DateTime.utc();

      // Create a new user record
      const user = new User({
        mainaddress: authAddress,
        challenge: signatureService.generateRandomHex(),
        createdAt: now.toJSDate()
      });

      // Save the user record to the database
      await user.save();

      const successResponse = {
        error: [],
        result: user
      };
      return reply.send(successResponse);
    } catch (error) {
      console.error('Error registering user:', error);
      const errorResponse = {
        error: ['Registration failed. Please try again later.']
      };
      return reply.status(500).send(errorResponse);
    }


  }

  async function login(request, reply){

    try {

      // Check if required data is present in the request
      const { authAddress, authSignature, authChallenge } = request.body;
      if (!authAddress || !authSignature || !authChallenge) {
        const errorResponse = {
          error: ['Required data is missing in the request. Please check API documentation to pass data correctly.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Validate the authAddress format
      if (!web3validator.isAddress(authAddress)) {
        const errorResponse = {
          error: ['Invalid authAddress. Please check address format.']
        };
        return reply.status(400).send(errorResponse);
      }


      // Verify signature for new user
      const userAuthenticated = await verifyUserSignature(authAddress, authSignature, authChallenge, reply);
      if (!userAuthenticated || !userAuthenticated._id) {
        const errorResponse = {
          error: ['Failed to login user with this address and this signature.']
        };
        return reply.status(400).send(errorResponse);
      }


        const userChallenge = await User.findOne({ mainaddress: authAddress });
        // Validate the authChallenge
        const challengeMessage = userChallenge.challenge;

        if (authChallenge !== challengeMessage) {
          const errorResponse = {
            error: ['Wrong AuthChallenge. Please check API documentation to pass data correctly. Use route /auth/challenge to get auth Challenge.']
          };
          return reply.status(400).send(errorResponse);
        }


      // Create a copy of userAuthenticated to pass to generateToken, use { transform: true } to only keep fields in model
      const userForToken = userAuthenticated.toObject({ transform: true });

      const token = generateToken(userForToken);

       // Verify the signature
       const signatureService = new SignatureService();
       userAuthenticated.challenge = signatureService.generateRandomHex();
       const now = DateTime.utc();
       userAuthenticated.lastLogin = now.toJSDate();

      // Save the user record to the database
      await userAuthenticated.save();

      const successResponse = {
        error: [],
        result: token
      };
      return reply.send(successResponse);
    } catch (error) {
      console.error('Error loging user:', error);
      const errorResponse = {
        error: ['Login failed. Please try again later.']
      };
      return reply.status(500).send(errorResponse);
    }

  }


async function verifySignatureForNewUser(expectedAddress, signedMessage, originalMessage, reply) {
  try {
    const msgBuffer = ethUtil.toBuffer(originalMessage);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const sigParams = ethUtil.fromRpcSig(signedMessage);
    const publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    const recoveredAddress = ethUtil.pubToAddress(publicKey).toString('hex');
    const ethAddress = `0x${recoveredAddress}`;

    if (ethAddress) {
      // If recovered address is different from expected address, abort
      if (ethAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        const stringError = 'Signature authentication returned a different address: ' + ethAddress;
        const errorResponse = {
          error: [stringError]
        };
        return reply.status(400).send(errorResponse);
      }

      const formattedEthAddress = ethAddress.toLowerCase();
      // Assuming you have access to your User model
      const user = await User.findOne({ mainaddress: formattedEthAddress });

      if (user) {
        const stringError = 'User already exists for this address: ' + ethAddress;
        const errorResponse = {
          error: [stringError]
        };
        return reply.status(400).send(errorResponse);
      } else {
        return 'SUCCESS';
      }
    } else {
      const errorResponse = {
        error: ['Signature verification failed']
      };
      return reply.status(400).send(errorResponse);
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    const errorResponse = {
      error: ['Signature verification failed']
    };
    return reply.status(500).send(errorResponse);
  }
}


async function verifyUserSignature(expectedAddress, signedMessage, originalMessage, reply) {
  try {
    const msgBuffer = ethUtil.toBuffer(originalMessage);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const sigParams = ethUtil.fromRpcSig(signedMessage);
    const publicKey = ethUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
    const recoveredAddress = ethUtil.pubToAddress(publicKey).toString('hex');
    const ethAddress = `0x${recoveredAddress}`;

    if (ethAddress) {
      // If recovered address is different from expected address, abort
      if (ethAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        const stringError = 'Wrong signature. Signature authentication returned a different address: ' + ethAddress;
        const errorResponse = {
          error: [stringError]
        };
        return reply.status(400).send(errorResponse);
      }

      const formattedEthAddress = ethAddress.toLowerCase();
      // Assuming you have access to your User model
      const user = await User.findOne({ mainaddress: formattedEthAddress });

      if (!user) {
        const stringError = 'No User registered for this address: ' + ethAddress;
        const errorResponse = {
          error: [stringError]
        };
        return reply.status(400).send(errorResponse);
      } else {
        return user;
      }
    } else {
      const errorResponse = {
        error: ['Signature verification failed']
      };
      return reply.status(400).send(errorResponse);
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    const errorResponse = {
      error: ['Signature verification failed']
    };
    return reply.status(500).send(errorResponse);
  }
}

  module.exports = {
    register,
    login,
  };
