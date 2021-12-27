FROM node:14

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src

COPY app/package*.json /src/
COPY . .

RUN npm install

#ADD app/nodemon.json /src/nodemon.json

EXPOSE 5001

#CMD npm start

CMD ["nodemon", "app/bin/www", "--port", "5001"]

#CMD ["nodemon",  "app/server.js",  "--port", "5001"]