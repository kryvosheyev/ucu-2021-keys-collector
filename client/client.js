const myWs = new WebSocket('ws://localhost:9001');
myWs.onopen = function () {
    console.log('Client: I connected');
    subscribeToChannel(["aws"]);
};
myWs.onmessage = function (message) {
    console.log('Message: %s', message.data);
};

function wsSendEcho(value) {
    console.log("sending", JSON.stringify({action: 'ECHO', data: value.toString()}))
    myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}));
}

function wsSendPing() {
    myWs.send(JSON.stringify({action: 'PING'}));
}

function subscribeToChannel(services){
    myWs.send(JSON.stringify({action: 'SUBSCRIBE_TO_SERVICES', data: services}));
}

