const User = require("../models/user.model");
const Comment = require("../models/comment.model");
const Proposal = require("../models/proposal.model");
const { Web3 } = require('web3');
const web3validator = require('web3-validator');

const { abi } = require('../../EticaRelease.json');

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const web3 = new Web3(MAINRPC);
const contract = new web3.eth.Contract(abi, CONTRACTADDRESS);

const RANDOM_ADDRESS = '0x8d5D6530aD5007590a319cF2ec3ee5bf8A3C35AC';

async function createProposal(request, reply) {
  try {

    // Extract proposal ID from the request body or params, assuming it's passed in the request
    const reqproposal = request.body; // Adjust this according to how the proposal ID is passed

    if (!reqproposal || !reqproposal.hash) {
      return reply.status(404).send("Wrong request format. The hash field is missing in request body, please check API documentation to find expected request format");
    }
    
    // Find the proposal by its ID
    const exist_proposal = await Proposal.findOne({ hash: reqproposal.hash });
    if (exist_proposal) {
      return reply.status(404).send("This Proposal is already added to database");
    }
    
    // If proposal hash is not a valid 32bytes hash return false
    if(!(await checkIsBytes32(reqproposal.hash))){
      return reply.status(404).send("Proposal is not a bytes32. Make sure to provid a correct proposal hash.");
    }

    // If proposal hash doesn't exist on blockchain return false
    if(!(await checkProposalExistence(reqproposal.hash))){
      return reply.status(404).send("No Proposal found on blockchain with this hash. Check your rpc endpoint or make sure the proposal hash exists on the network of your rpc.");
    }

    const proposal = new Proposal(request.body);
    const result = await proposal.save();
    reply.send(result);
  } catch (error) {
    reply.status(500).send(error);
  }
}

async function checkProposalExistence(_proposalhash){

    let proposal = await contract.methods.proposals(_proposalhash).call();
    // proposal found:
    if(proposal[0] > 0){
      return true;
    }
    else {
      return false;
    }

}

async function checkIsBytes32(_hash){

  try {
  let isBytes32 = web3validator.isHexStrict(_hash) && /^0x[0-9a-f]{64}$/i.test(_hash);
  if(isBytes32){
    return true;
  }
  else{
    return false;
  }
  } catch (error) {
    console.error('Error checking if hex is strict:', error);
    return false; // Return false if there's an error
  }

}


async function getProposal(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { id: proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Send the comments associated with the proposal in the response
    reply.send(proposal);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function getProposalComments(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

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


async function getProposalWithComments(request, reply) {
  try {
    // Extract the proposal ID from the request params
    const { proposalId } = request.params;

    // Find the proposal by its ID and populate the comments field
    const proposal = await Proposal.findOne({ _id: proposalId }).populate('comments');

    // If the proposal doesn't exist, return a 404 status
    if (!proposal) {
      return reply.status(404).send("Proposal not found");
    }

    // Send the comments associated with the proposal in the response
    reply.send(proposal);
  } catch (error) {
    // If an error occurs, send a 500 status code along with the error message
    reply.status(500).send(error);
  }
}


async function getProposals(request, reply) {
  try {
    const proposals = await Proposal.find();
    reply.send(proposals);
  } catch (error) {
    reply.status(500).send(error);
  }
}



module.exports = {
  createProposal,
  getProposal,
  getProposals,
  getProposalComments,
  getProposalWithComments,
};
