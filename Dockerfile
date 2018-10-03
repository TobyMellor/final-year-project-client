FROM node:10.11.0

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json .
RUN npm install --silent

# Bundle app source
COPY . .

# Start app
EXPOSE 8080
CMD ["npm", "run", "prod"]
