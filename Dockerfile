FROM node:10.11.0

# Set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --silent

# Bundle app source
COPY . /usr/src/app

# Start app
EXPOSE 8080
CMD ["npm", "start"]
