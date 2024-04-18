How to start mongo with docker for local dev:

1. Install a mongo container:
-> docker pull mongo
-> Then on Docker desktop UI, launch a new mongods container
OR
-> cd etica-socialnetwork-api/mongo-docker
-> docker build -t eticasocials-mongodb -f Dockerfile.mongodb .
2. From git bash command line:
-> winpty docker exec -it mongodbeticasocials mongosh (replace mongodbeticasocials by the name of the container)
