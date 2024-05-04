const fastify = require("fastify")({ logger: false });
const mongoose = require("mongoose");
require("dotenv").config();

const { basicAuth } = require("./middlewares/auth")

// Import my routes
const authenticationRoutes = require("./routes/authentication.routes");
const userRoutes = require("./routes/user.routes");
const proposalRoutes = require("./routes/proposal.routes");
const commentRoutes = require("./routes/comment.routes");
// Connect to my database
console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((e) => console.log("Error connecting to database", e));

// start my server
fastify.register(authenticationRoutes, { prefix: "/api/v1/auth" });
fastify.register(userRoutes, { prefix: "/api/v1/user" });
fastify.register(proposalRoutes, { prefix: "/api/v1/proposal" });
fastify.register(commentRoutes, { prefix: "/api/v1/comment" });

// fastify.addHook("preHandler", basicAuth);


const start = async () => {
  try {
    console.log('starting on process.env.PORT', process.env.PORT);
    //await fastify.listen(process.env.PORT || 5000);
    fastify.listen({ port: 5000, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        fastify.log.error(err)
        process.exit(1)
      }
    });
    /* console.log('-> Server is running on port: ', fastify.server);
    fastify.log.info(
      `Server is running on port ${fastify.server}`
    ); */
  } catch (error) { console.log('error starting fastify: ', error);}
};

start();
