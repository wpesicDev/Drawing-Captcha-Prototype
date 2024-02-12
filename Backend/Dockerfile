FROM node:16.14.0-alpine 

WORKDIR ./

COPY package.json ./

RUN npm install

RUN npm serve

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "serve" ]