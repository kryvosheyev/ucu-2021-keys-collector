const axios = require('axios');
const _ = require("lodash");
const {STREAMER_API_SEND_COLLECTED_KEYS_URL} = require('../config');

async function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        }, ms));
};

async function sleepWhileUpdateInProgress() {
    return new Promise(async (resolve, reject) => {
        let updateInProgressTimeout = Math.round(Math.random() * 10)+1;
        console.log(`Creating fake delay of ${updateInProgressTimeout} seconds...`);
        for (let i = 0; i < updateInProgressTimeout; i++) {
            console.log(`UPDATE IS IN PROGRESS, ${i + 1} seconds passed`);
            await sleep(1000);
            continue;
        }
        resolve();
    })
}

function isEmpty(obj){
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function sendResponse(res, status, body){
    if(!res.headersSent) {
        console.log("sending response to client=", body);
        res.status(status).send(body);
    } else {
        //console.log("headersSent already for status=", status, " body=", body);
    }
}

async function  sendPostHTTP(baseUrl, url, body) {
    return new Promise(async (resolve, reject) => {
        console.log(`Start sendPostHTTP to url=${baseUrl+url}`);
        try {
            let response = await axios({
                method: 'post',
                url: url,
                baseURL: baseUrl,
                data: body
            });
            resolve(response);
        }
        catch (err) {
            reject(err);
        }
    })
};

async function reqToNodeSendMsgWithoutAck(node, url, data, timeout) {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log("reqToNodeSendMsgWithoutAck sending data=", data);
            console.log("reqToNodeSendMsgWithoutAck sending keys=", {keys: _.map(_.concat([], data), 'msg')});
            // console.log("url=", url, " ")
            let response = await axios({
                method: 'post',
                url: STREAMER_API_SEND_COLLECTED_KEYS_URL,
                baseURL: url,
                timeout: timeout,
                data: {keys: _.concat([], _.map(data, 'msg'))}
            });
            // REQ_ACK, returned { added:[]} with array of ids like [3,4]
            if (response.data && response.data.added && response.data.added.length) {
                let added =  _.map(_.uniqBy(_.concat([], data), '_id_curr'), '_id_curr');
                resolve({node:node, added:added});
            } else {
                resolve({node:node, added:[]});
            }
        } catch (err) {
            // console.log(`reqToNodeSendMsg failed to send msg to node=${node.name}`);
            resolve({node:node, added:[]})
        }
    })
}

async function reqToNodeSendMsg(node, url, data, timeout) {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log("url=", url, " ")
            let response = await axios({
                method: 'post',
                url: STREAMER_API_SEND_COLLECTED_KEYS_URL,
                baseURL: url,
                timeout: timeout,
                data: {data: _.concat([], data)}
            });
            // REQ_ACK, returned { added:[]} with array of ids like [3,4]
            // console.log("response.data=",response.data);
            if (response.data && response.data.added && response.data.added.length) {
                resolve({node:node, added:response.data.added});
            } else {
                resolve({node:node, added:[]});
            }
        } catch (err) {
            // console.log(`reqToNodeSendMsg failed to send msg to node=${node.name}`);
            resolve({node:node, added:[]})
        }
    })
}

async function isFileAlreadyProcessed(fileHash){
    // TODO implement
    return false;
}

async function getFileAsStr(fileUrl){
    // TODO implement
    /*
       download
       save to /config.DOWNLOAD_DIR
       return as str
     */
    return " key = HGFDYREWRESSFSTER";
}

module.exports = {
    sleepWhileUpdateInProgress,
    isEmpty,
    sendPostHTTP,
    reqToNodeSendMsg,
    reqToNodeSendMsgWithoutAck,
    sendResponse,
    sleep,
    isFileAlreadyProcessed,
    getFileAsStr
}