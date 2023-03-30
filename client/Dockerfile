# Base image
FROM node
# Make folder to put our files in
RUN mkdir -p /usr/social-network
RUN mkdir -p /usr/src/social-network/client
# Set working directory so that all
# subsequent command runs in this folder
WORKDIR /usr/src/social-network/client
# Copy package json and install dependencies
COPY package*.json ./
RUN npm install
# Copy our app
COPY . .
# Expose port to access server
EXPOSE 8010
# Command to run our app
# npm build then npm serve
CMD [ "sh", "-c", "npm run build && npm run serve" ]