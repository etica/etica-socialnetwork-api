// Webhooks.js
const axios = require('axios');
const { Web3 } = require('web3');

class WebhookService {
  async discord_new_proposal(proposal, webhookUrl) {
    console.log('sending new discord webhook proposal:', proposal);
    try {
      const payload = {
        content: `New Etica Proposal: ${proposal.title}`,
        embeds: [{
          title: proposal.title,
          description: proposal.description.substring(0, 2048), // Discord has a 2048 character limit for embed descriptions
          color: 3447003, // Blue color
          fields: [
            {
              name: "Proposal Hash",
              value: proposal.hash,
              inline: true
            },
            {
                name: "Disease",
                value: proposal.diseasename,
                inline: false
            },
            {
                name: "Chunk",
                value: proposal.chunkname,
                inline: true
            },
            {
              name: "Proposer",
              value: proposal.proposer,
              inline: false
            },
            {
                name: "IPFS Hash",
                value: proposal.raw_release_hash,
                inline: false
            },
            {
              name: "Voting Starts",
              value: new Date((Web3.toBN(proposal.starttime).mul(Web3.toBN('1000'))).toString()).toUTCString(),
              inline: false
            },
            {
              name: "Voting Ends",
              value: new Date((Web3.toBN(proposal.endtime).mul(Web3.toBN('1000'))).toString()).toUTCString(),
              inline: false
            },
            {
                name: "Approval Threshold",
                value: proposal.approvalthreshold,
                inline: false
            }
            
          ],
          url: `https://eticascan.org/proposal/${proposal.proposed_release_hash}`
        }]
      };

      console.log('sending new proposal webhook with payload:', payload);

      await axios.post(webhookUrl, payload);
      console.log('Discord webhook notification sent successfully');
    } catch (error) {
      console.error('Error sending Discord webhook notification:', error);
    }
  }
}

module.exports = WebhookService;