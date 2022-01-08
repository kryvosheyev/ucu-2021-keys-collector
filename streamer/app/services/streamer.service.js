const WebSocket = require('ws');
const { v4: uuidv4 } = require("uuid");
const { Subject, map, filter } = require('rxjs');
const _ = require("lodash");

let wsServer;
const CLIENTS={};
const subject = new Subject();

const CLIENTS_SUBSCRIPTIONS = {};

function subscribeClient(uuid, services, cb){
  if(CLIENTS_SUBSCRIPTIONS[uuid]) {
    console.log(`client uuid=${uuid} unsubscribes from services [${CLIENTS[uuid].services}]`);
    CLIENTS_SUBSCRIPTIONS[uuid].unsubscribe();
  }

  console.log(`client uuid=${uuid} subscribes to services [${services}]`);
  CLIENTS[uuid].services = [...services];
  CLIENTS_SUBSCRIPTIONS[uuid]= subject.pipe(
      filter( x=> services.includes(x.aKey.service.valueOf()))
  ).subscribe(x => cb(uuid, x.aKey));
}

function startWsServer(port){
  wsServer = new WebSocket.Server({ port: port });
  wsServer.on('connection', onConnect);
  console.log('websocket server is on port 9001');
  mockConnect();
}

function processData(keys) {
  keys.forEach((aKey) => {
        subject.next({
          aKey: aKey
        })
      })
}

function mockConnect(){
  CLIENTS["uuid1"] = {
    ws: "wsClient1",
    services: []
  };
  CLIENTS["uuid2"] = {
    ws: "wsClient2",
    services: []
  };
  CLIENTS["uuid3"] = {
    ws: "wsClient3",
    services: []
  };

  subscribeClient('uuid1', ['aws', 'twitter'], sendToClient );
  subscribeClient('uuid2', ['aws'], sendToClient );
  subscribeClient('uuid2', ['google'], sendToClient );
  subscribeClient('uuid3', ['twitter'], sendToClient );
}


function onConnect(wsClient) {
  wsClient.uuid = uuidv4();
  CLIENTS[wsClient.uuid] = {
    ws: wsClient,
    services: []
  };
  console.log(`new client connected, uuid=${wsClient.uuid}`);
  wsClient.send('msg from server: hello');

  wsClient.on('close', function() {
    delete CLIENTS[wsClient.uuid];
    console.log(`client disconnected, uuid=${wsClient.uuid}`);
    if(CLIENTS_SUBSCRIPTIONS[wsClient.uuid]) {
      console.log(`client uuid=${wsClient.uuid} unsubscribes from services [${CLIENTS[uuid].services}]`);
      CLIENTS_SUBSCRIPTIONS[uuid].unsubscribe();
    }
  });

  wsClient.on('message', function(message) {
    console.log(message);
    try {
      const jsonMessage = JSON.parse(message);
      switch (jsonMessage.action) {
        case 'ECHO':
          wsClient.send(jsonMessage.data);
          break;
        case 'PING':
          setTimeout(function() {
            wsClient.send('PONG');
          }, 2000);
          break;
        case 'BROADCAST':
          wsServer.clients.forEach(function each(client) {
            client.send(jsonMessage.data);
          });
          break;
        case 'SUBSCRIBE_TO_SERVICES':
          const services = _.concat([], jsonMessage.data);
          subscribeClient(wsClient.uuid, services, sendToClient);
          wsClient.send(`you subscribed to services ${services}`);
          break;
        default:
          console.log('unknown command');
          break;
      }
    } catch (error) {
      console.log('error', error);
    }
  });
}

function sendToClient(uuid, obj){
  console.log("wsClient.uuid=",uuid, obj);
  if(uuid.length === "8dc08f5d-bdf4-45cf-8b2c-ce1173f5c10c".length){
    CLIENTS[uuid].ws.send(JSON.stringify(obj));
  }
}

module.exports = {
  startWsServer,
  processData
}