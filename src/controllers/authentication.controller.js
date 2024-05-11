const jwt = require('jsonwebtoken');
const SignatureService = require('../services/SignatureService');
const ethUtil = require ('ethereumjs-util');
const web3validator = require('web3-validator');
const { Web3 } = require('web3');
const web3 = new Web3();
const { DateTime } = require('luxon');

const User = require("../models/user.model");
require('dotenv').config();
const secretKey = process.env.SECRETKEY;
const REGISTERCHALLENGE = process.env.REGISTERCHALLENGE;


    // Function to generate a JWT token with an expiration time
    function generateToken(payload) {
      // Set expiration time to 1 hour from now (in seconds)
      const expiresIn = 3600; // 1 hour
      return jwt.sign(payload, secretKey, { expiresIn });
    }

    // Get Challenge to Register
    async function getChallengeGeneral(request, reply){

      try {

        const successResponse = {
          error: [],
          result: REGISTERCHALLENGE
        };
        return reply.send(successResponse);
      } catch (error) {
        console.error('Error getChallengeGeneral:', error);
        const errorResponse = {
          error: ['Error getChallengeGeneral. Please try again later.']
        };
        return reply.status(500).send(errorResponse);
      }

  }



  async function register(request, reply){

    try {

      // Check if required data is present in the request
      const { authAddress, authSignature, authChallenge, username } = request.body;
      if (!authAddress || !authSignature || !authChallenge) {
        const errorResponse = {
          error: ['Required data is missing in the request. Please check API documentation to pass data correctly.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Validate the authChallenge
      if (authChallenge !== REGISTERCHALLENGE) {
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
        username: username || null, // Set username to null if not provided
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

  // Get Challenge to Login
  async function getChallengeUser(request, reply){

    try {
  
      // Extract the user ID from the request params
    const { userAddress: userAddress } = request.params;

    // Find the proposal by its ID and populate the comments field
    const user = await User.findOne({ mainaddress: userAddress });

    // If the user doesn't exist, return a 404 status
    if (!user) {
      return reply.status(404).send("User not found");
    }
  
      const challenge = user.challenge;
      const successResponse = {
        error: [],
        result: challenge
      };
      return reply.send(successResponse);
    } catch (error) {
      console.error('Error getChallengeUser:', error);
      const errorResponse = {
        error: ['Error getChallengeUser. Please try again later.']
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
          success: false,
          error: ['Required data is missing in the request. Please check API documentation to pass data correctly.']
        };
        return reply.status(400).send(errorResponse);
      }

      // Validate the authAddress format
      if (!web3validator.isAddress(authAddress)) {
        const errorResponse = {
          success: false,
          error: ['Invalid authAddress. Please check address format.']
        };
        return reply.status(400).send(errorResponse);
      }


      // Verify signature for new user
      const userAuthenticated = await verifyUserSignature(authAddress, authSignature, authChallenge, reply);
      if (!userAuthenticated || !userAuthenticated._id) {
        const errorResponse = {
          success: false,
          error: ['Failed to login user with this address and this signature.']
        };
        return reply.status(400).send(errorResponse);
      }


        const userChallenge = await User.findOne({ mainaddress: authAddress });
        // Validate the authChallenge
        const challengeMessage = userChallenge.challenge;

        if (authChallenge !== challengeMessage) {
          const errorResponse = {
            success: false,
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
        success: true,
        result: token
      };
      return reply.send(successResponse);
    } catch (error) {
      console.error('Error loging user:', error);
      const errorResponse = {
        success: false,
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
    getChallengeGeneral,
    getChallengeUser
  };
