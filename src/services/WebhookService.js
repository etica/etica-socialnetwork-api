// Webhooks.js
const axios = require('axios');
const { DateTime } = require("luxon");

class WebhookService {
  async discord_new_proposal(proposal, webhookUrl) {
    console.log('sending new discord webhook proposal:', proposal);
    console.log('proposal.starttime is', proposal.starttime);
    console.log('typeof proposal.starttime is', typeof proposal.starttime);

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
              value: DateTime.fromSeconds(Number(proposal.starttime)).toUTC().toFormat("yyyy-MM-dd HH:mm:ss 'UTC'"),
              inline: false
            },
            {
              name: "Voting Ends",
              value: DateTime.fromSeconds(Number(proposal.endtime)).toUTC().toFormat("yyyy-MM-dd HH:mm:ss 'UTC'"),
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