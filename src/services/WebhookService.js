// Webhooks.js
const axios = require('axios');
const { DateTime } = require("luxon");

class WebhookService {
  async discord_new_proposal(proposal, webhookUrl) {
    console.log('sending new discord webhook proposal:', proposal);
    console.log('proposal.starttime is', proposal.starttime);
    console.log('typeof proposal.starttime is', typeof proposal.starttime);


    /*
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
              value: `datehere starttime`,
              inline: false
            },
            {
              name: "Voting Ends",
              value: `datehere endtime`,
              inline: false
            },
            {
                name: "Approval Threshold",
                value: proposal.approvalthreshold.toString(),
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
    } */

      console.log(' moment(proposal.endtime).format("X") : ',  moment(proposal.endtime).format("X"));


    try {
      const payload = {
        content: `NEW PROPOSAL: ${proposal.title.substring(0, 100)}...`, // Limit title length
        embeds: [{
          title: proposal.title.substring(0, 256), // Discord title limit is 256 characters
          description: proposal.description.substring(0, 1000), // Discord description limit is 4096 characters
          color: 3447003,
          fields: [
            {
              name: "Proposal Hash",
              value: proposal.hash,
              inline: true
            },
            {
              name: "Disease",
              value: proposal.diseasename || "N/A",
              inline: false
            },
            {
              name: "Chunk",
              value: proposal.chunkname || "N/A",
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
              value: moment(proposal.starttime).format("X"),
              inline: false
            },
            {
              name: "Voting Ends",
              value: moment(proposal.endtime).format("X"),
              inline: false
            },
            {
              name: "Approval Threshold",
              value: proposal.approvalthreshold.toString(),
              inline: false
            },
            {
              name: "Period",
              value: proposal.periodid.toString(),
              inline: false
            }
          ],
          url: `https://eticascan.org/proposal/${proposal.hash}` // Use proposal hash instead of undefined
        }]
      };
  
      console.log('Sending new proposal webhook with payload:', JSON.stringify(payload));
  
      const response = await axios.post(webhookUrl, payload);
      console.log('Discord webhook notification sent successfully');
      return response;
    } catch (error) {
      console.error('Error sending Discord webhook notification:', error.response ? error.response.data : error.message);
      throw error;
    }


  }
}

module.exports = WebhookService;