**etica-socialnetwork-api**

**Description:**

**etica-socialnetwork-api** is an open-source API built with Fastify, designed to handle comments on Etica proposals, reviews, feedback, discussions between researchers, voters, and tips. 

**Features:**
- **Comment Handling:** Manage comments on various aspects of Etica, including proposals, reviews, feedback, and discussions.
- **Discussions:** Facilitate interaction between researchers, voters, and other participants in the Etica ecosystem.
- **Cross sites interactions:** Enable multiple websites to share comments and reviews on Etica proposals.
- **Tips:** Allow users to send ETI and EGAZ tips to other users who made interesting reviews, comments or to researchers.

**Integration with etica-explorer-engine.js:**
**etica-socialnetwork-api** integrates with **etica-explorer-engine.js** to keep in sync with the Etica mainnet. This ensures that the API reflects the latest data and activities happening on the Etica platform.

**Usage:**

To use **etica-socialnetwork-api**, simply clone the repository and follow the setup instructions provided in the documentation.

**Contributing:**

Contributions to **etica-socialnetwork-api** are welcome! Whether it's bug fixes, feature enhancements, or documentation improvements, feel free to contribute to make the API even better.

**License:**

**etica-socialnetwork-api** is open source licensed under the MIT License.


**Local Dev commands Help:**

- Mongo local dev settup help:
Instructions in mongo-docker/instructions.md

- Run generate-env-keys.js to generate .env SECRETKEY and REGISTERCHALLENGE

- start api:
node src/app.js

- start script to keep synced with blockchain new proposals


**Prod commands Help:**
- Install mongo:
https://cloudinfrastructureservices.co.uk/install-mongodb-on-ubuntu-community-edition/

create database:
> mongo
> db.createCollection("eticasocialsdb")
> use eticasocialsdb
> db.initialCollection.insertOne({ exampleField: "exampleValue" })
> show databases
