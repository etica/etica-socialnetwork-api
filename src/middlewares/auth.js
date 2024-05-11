const jwt = require('jsonwebtoken');
const SignatureService = require('../services/SignatureService');
const ethUtil = require ('ethereumjs-util');
const web3validator = require('web3-validator');
const { Web3 } = require('web3');
const web3 = new Web3();
const { DateTime } = require('luxon');

const User = require('../models/user.model');

require('dotenv').config();
const secretKey = process.env.SECRETKEY;

async function apiKeyAuth(request, reply) {

	const apiKey = request.headers['x-api-key'];

	try {

	 // Verify and decode the generated token
	 const decodedToken = verifyToken(apiKey);
	 if (decodedToken) {
		request.user = decodedToken;
		return;
	 } 
	 else {
		throw new Error("Unauthorized");
	}
    
    } catch (error) {
	//console.error('Error in apiKeyAuth middleware:', error.message);
	return reply.code(401).send({ error: error.message });
    }
	
}

// Function to verify and decode a JWT token
function verifyToken(token) {
	try {
	  // Verify the token and decode its payload
	  const decoded = jwt.verify(token, secretKey);
	  return decoded;
	} catch (error) {
		//console.error('Token verification failed:', error.message);
		throw new Error("Unauthorized: " + error.message);
	}
  }
  

async function basicAuth(request, reply) {
	const authHeader = request.headers['authorization'];

	if (!authHeader) {
		return reply.status(401).send({ error: "No authorization header" })
	}

	const [authType, authKey] = authHeader.split(" ");

	if (authType !== 'Basic') {
		return reply.status(401).send({ error: "Requires basic auth (username/password)" })
	}

	const [email, password] = Buffer.from(authKey, 'base64').toString('ascii').split(":")

	try {
		const user = await User.findOne({ email }).select("password")

		if (!user) {
			return reply.status(401).send({ error: "User not found." });
		}

		const isMatch = await user.comparePassword(password);

		if (!isMatch) {
			return reply.status(401).send({ error: "Incorrect password." });
		}
	} catch (error) {
		console.log(error)
		return reply.status(500).send({ error: "An error occurred during authorization." })
	}
}

module.exports = { apiKeyAuth, basicAuth }