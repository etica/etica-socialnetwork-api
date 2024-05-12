const Proposal = require("./src/models/proposal.model");
const { Web3 } = require('web3');
const web3validator = require('web3-validator');
const { abi } = require('./EticaRelease.json');
const mongoose = require("mongoose");

const dotenv = require('dotenv');
dotenv.config();

const CONTRACTADDRESS = process.env.CONTRACT_ADDRESS;
const MAINRPC = process.env.MAIN_RPC;
const web3 = new Web3(MAINRPC);
const contract = new web3.eth.Contract(abi, CONTRACTADDRESS);

const RANDOM_ADDRESS = '0x8d5D6530aD5007590a319cF2ec3ee5bf8A3C35AC';

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((e) => console.log("Error connecting to database", e));


async function checkNewProposals(){

    // get last index
    // const lastProposal = await Proposal.findOne({}).sort({ index: -1 }); warning
    const lastProposal = await Proposal.findOne({}).sort({ index: -1 }); // warning rewrite query to get listed index order
    console.log('lastProposal is :', lastProposal);

    var lastSavedIndex = 0;
    /*if(lastProposal && lastProposal.index){
        console.log('lastProposal.index was assessed to true');
        console.log('lastProposal.index was assessed : ', lastProposal.index);
         lastSavedIndex = lastProposal.index;
    } */

    console.log('lastSavedIndex is: ', lastSavedIndex);


    const LastProposalIndexFromBlockchain = await getLastProposalIndexFromBlockchain();
    console.log('LastProposalIndexFromBlockchain is: ', LastProposalIndexFromBlockchain);

    let proposalsdelay = LastProposalIndexFromBlockchain - lastSavedIndex;
    console.log('proposal delay is: ', proposalsdelay);

    if(proposalsdelay > 0){

          for (let i = 0; i < proposalsdelay; i++){

            let j = lastSavedIndex + 1 + i; // implements j counter because (LastProposalIndexFromBlockchain - i) was inserting in inverse order. example 10479 thne 10478 ...
            console.log('j: ', j);
           // Check if proposal exists in your database
                // Get proposal from blockchain:
                let prophash = await contract.methods.proposalsbyIndex(j).call();
                console.log('prophash: ', prophash);
                const oneproposal = await contract.methods.proposals(prophash).call();

                if(oneproposal && oneproposal[1]){

                    const proposalExists = await Proposal.findOne({ hash: oneproposal[1] });

                    // If proposal doesn't exist in database, create it:
                    if (!proposalExists) {
                        console.log('proposal does not exist: ', oneproposal[0]);
                        console.log('proposal does not exist: ', oneproposal[1]);
                        await createProposal(oneproposal);
                    }
                    else {
                        console.log('proposal already exist: ', oneproposal[0]);
                        console.log('proposal already exist: ', oneproposal[1]);
                        
                    }

                }

           }

    }


}



async function getLastProposalIndexFromBlockchain() {
    try {

        // Call the appropriate method to get the last proposal index from the blockchain
        const lastProposalIndex = await contract.methods.proposalsCounter().call();

        return parseInt(lastProposalIndex);
    } catch (error) {
        console.error('Error fetching last proposal index from blockchain:', error);
        throw error;
    }
}


async function createProposal(_proposal) {
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
        newproposal.index = Number(_proposal[0]);
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
        return result;

      }

    } catch (error) {
      return error;
    }
}


checkNewProposals();