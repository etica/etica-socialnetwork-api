// Webhooks.js
const axios = require('axios');
const { DateTime } = require("luxon");
var moment = require("moment");

class WebhookService {
  async discord_new_proposal(proposal, webhookUrl) {

    const startTimeNumber = Number(proposal.starttime);
    const endTimeNumber = Number(proposal.endtime);

    try {
      const payload = {
      content: `***NEW RESEARCH PROPOSAL*** (votes: _${moment.unix(startTimeNumber).format("MMM Do YYYY hh:mm")}_ - _${moment.unix(endTimeNumber).format("MMM Do YYYY hh:mm")}_)`,
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
              value:  moment.unix(startTimeNumber).format("MMM Do YYYY hh:mm"),
              inline: false
            },
            {
              name: "Voting Ends",
              value:  moment.unix(endTimeNumber).format("MMM Do YYYY hh:mm"),
              inline: false
            },
            {
              name: "Approval Threshold",
              value: `${Number((proposal.approvalthreshold)) / 100}%`,
              inline: false
            },
            {
              name: "Period",
              value: proposal.periodid,
              inline: false
            }
          ],
          url: `https://etica.io/app/main/proposal?proposalhash=${proposal.hash}` // Use proposal hash instead of undefined
        }]
      };
  
      const response = await axios.post(webhookUrl, payload);
      return response;
    } catch (error) {
      console.error('Error sending Discord webhook notification:', error.response ? error.response.data : error.message);
      throw error;
    }


  }
}

module.exports = WebhookService;