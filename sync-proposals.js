const Proposal = require("./src/models/proposal.model");
const { Web3 } = require('web3');
const web3validator = require('web3-validator');
const { abi } = require('./EticaRelease.json');
const mongoose = require("mongoose");

const dotenv = require('dotenv');
dotenv.config();

const WebhookService = require("./src/services/WebhookService");

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const web3 = new Web3(MAINRPC);
const contract = new web3.eth.Contract(abi, CONTRACTADDRESS);

const RANDOM_ADDRESS = '0x8d5D6530aD5007590a319cF2ec3ee5bf8A3C35AC';

class ProposalsSync {

    constructor() {

        mongoose
        .connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        .then(() => console.log("Connected to the database"))
        .catch((e) => console.log("Error connecting to database", e));

    }

async checkNewProposals(){

  console.log('inside checkNewProposals');

    // get last proposalindex
    // const lastProposal = await Proposal.findOne({}).sort({ proposalindex: -1 }); warning
    const lastProposal = await Proposal.findOne({}).sort({ "proposalindex": -1 }); // warning rewrite query to get list in proposalindex decreassing order

    var lastSavedId = 0;
    if(lastProposal && lastProposal.proposalindex){
         lastSavedId = lastProposal.proposalindex;
    }

    console.log('lastSavedId is: ', lastSavedId);


    const LastProposalIndexFromBlockchain = await this.getLastProposalIndexFromBlockchain();

    let proposalsdelay = LastProposalIndexFromBlockchain - lastSavedId;

    console.log('proposalsdelay is:', proposalsdelay);

    if(proposalsdelay > 0){

          for (let i = 0; i < proposalsdelay; i++){

            let j = lastSavedId + 1 + i; // implements j counter because (LastProposalIndexFromBlockchain - i) was inserting in inverse order. example 10479 thne 10478 ...

           // Check if proposal exists in your database
                // Get proposal from blockchain:
                let prophash = await contract.methods.proposalsbyIndex(j).call();
                const oneproposal = await contract.methods.proposals(prophash).call();

                if(oneproposal && oneproposal[1]){

                    const proposalExists = await Proposal.findOne({ hash: oneproposal[1] });

                    // If proposal doesn't exist in database, create it:
                    if (!proposalExists) {
                        const newproposal = await this.createProposal(oneproposal);
                    }

                }

           }

    }


}



async getLastProposalIndexFromBlockchain() {
    try {

        // Call the appropriate method to get the last proposal proposalindex from the blockchain
        const lastProposalIndex = await contract.methods.proposalsCounter().call();

        return parseInt(lastProposalIndex);
    } catch (error) {
        console.error('Error fetching last proposal proposalindex from blockchain:', error);
        throw error;
    }
}


async createProposal(_proposal) {
    try {
      // get diseasehash
      const diseaseIndex = await contract.methods.diseasesbyIds(_proposal[2]).call();
      const disease = await contract.methods.diseases(diseaseIndex).call();


      // get chunk
      const chunkid = _proposal[4];

      var chunkname = null;
      if(chunkid){
        const chunk = await contract.methods.chunks(chunkid).call();
        chunkname = chunk[3];
      }


      if(disease && disease[0] > 0){

        const newproposal = {};
        newproposal.title = _proposal[6];
        newproposal.description = _proposal[7];
        newproposal.hash = _proposal[1];
        newproposal.proposalindex = Number(_proposal[0]);
        newproposal.diseasehash = _proposal[2];
        newproposal.diseasename = disease[1];
  
        newproposal.chunkid = Number(chunkid);
        newproposal.chunkname = chunkname;
  
        newproposal.proposer = _proposal[5];
        newproposal.raw_release_hash = _proposal[9];
        newproposal.freefield = _proposal[8];
  
        newproposal.commentsopen = true;
        newproposal.comments = [];
        
        const proposal = new Proposal(newproposal);
        const result = await proposal.save();
        console.log('created newproposal result is: ',result);

        console.log('process.env.DISCORD_WEBHOOK_ACTIVATED', process.env.DISCORD_WEBHOOK_ACTIVATED);
            if(process.env.DISCORD_WEBHOOK_ACTIVATED){
              console.log('process.env.DISCORD_WEBHOOK_ACTIVATED PASSED');
            }

            console.log('process.env.DISCORD_WEBHOOK_NEW_PROPOSAL:', process.env.DISCORD_WEBHOOK_NEW_PROPOSAL);
            if(process.env.DISCORD_WEBHOOK_ACTIVATED && process.env.DISCORD_WEBHOOK_NEW_PROPOSAL){
              console.log('process.env.DISCORD_WEBHOOK_ACTIVATED && process.env.DISCORD_WEBHOOK_NEW_PROPOSAL PASSED');
            }
            
            if(process.env.DISCORD_WEBHOOK_ACTIVATED && process.env.DISCORD_WEBHOOK_NEW_PROPOSAL){
              console.log('--------- in process.env.DISCORD_WEBHOOK_ACTIVATED && process.env.DISCORD_WEBHOOK_NEW_PROPOSAL condition loop ----------');
              const webhookService = new WebhookService();
              const proposaldata = await contract.methods.propsdatas(proposal.hash).call();
              newproposal.approvalthreshold = proposaldata.approvalthreshold;
              newproposal.starttime = proposaldata.starttime;
              newproposal.endtime = proposaldata.endtime;
              webhookService.discord_new_proposal(newproposal, process.env.DISCORD_WEBHOOK_NEW_PROPOSAL);
            }

        return result;

      }

    } catch (error) {
        console.log('error:', error);
      return error;
    }
}



}

let syncProposals = new ProposalsSync();

syncProposals.checkNewProposals();

setInterval(() => {
    syncProposals.checkNewProposals();
}, 120 * 1000);