FROM node:19-alpine
WORKDIR /server
COPY package*.json .
RUN npm i
COPY . .
EXPOSE 80
CMD [ "npm", "start" ]