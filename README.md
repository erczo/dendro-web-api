# Dendro Web API

TODO: Briefly describe this repo and Project Dendro


## Instructions

1. Be sure you have Node version 6.5.x. If you’re using nvm, you may need to `nvm use 6.5.0`.

2. Clone this repo.

3. Make this project directory the current directory, i.e. `cd dendro-web-api`.

4. Install modules via `npm install`.

5. If all goes well, you should be able to run the predefined package scripts.


## To build and publish the Docker image

1. Make this project directory the current directory, i.e. `cd dendro-web-api`.

2. Build the project `docker build -t dendro:dendro-web-api .`.

3. Tag the desired image, e.g. `docker tag f0ec409b5194 dendro/dendro-web-api:latest`.

4. Push it via `docker push dendro/dendro-web-api`.


## Tasks

- [ ] Add logging: winston? Papertrail? Etc.
- [x] Define .editorconfig
- [ ] Write a proper README!
- [ ] Document code and package scripts
- [ ] Add copyright notices, license file, etc.
- [ ] Remember, project is in dev mode by default
- [ ] Don't leak stack traces
- [ ] Deal with configuration (inconsistent with web site)
- [ ] SQL logging is turned on - turn it off
- [ ] Add variables to model
- [ ] Rename SQL database to dendro_meta_oak
- [ ] Rename Influx database to dendro_oak
