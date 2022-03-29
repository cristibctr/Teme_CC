FROM node:16

# Create working directory for app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80

CMD ["node", "hello.js"]

