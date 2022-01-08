FROM node:14

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src

COPY app/package*.json /src/
COPY . .

RUN npm install

#ADD app/nodemon.json /src/nodemon.json

# REST on 7001
EXPOSE 7001

# WS on 9001
EXPOSE 9001

#CMD npm start
#CMD ["nodemon",  "app/server.js",  "--port", "5001"]

CMD ["nodemon", "app/bin/www", "--port", "7001"]
