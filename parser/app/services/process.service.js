const fs = require("fs");
const config = require('../config');
const {RESPONSE_MESSAGES} = require('../constants');
const moment = require('moment-timezone');
const _ = require("lodash");
const UTILS = require('../services/utils');
const STATE_SERVICE = require('../services/state.service');
const STORAGE_SERVICE = require('../services/master-storage.service');
const SEND_SERVICE = require('../services/send.service');

async function processMessage(fileHash, fileUrl, project, language, res) {
    console.log("processMessage...");
    let state = await STATE_SERVICE.getState();
    let file  = {
        fileHash, fileUrl, project, language
    };

    /*
     add to jobQueue

     jobQueueMonitor:
       take 1
         download to /downloaded
         parse
          >> detectedArr[] of records with detected keys
     */
    let detected = {
        detectedAt: UTILS.KievTimeNow(),
        project: 'github.xxx',
        fileUrl: 'github.xxxx',
        language: 'java',
        service: 'aws',
        found: 'JHUGFHFH',
    }

    let rLogMsg = await STORAGE_SERVICE.saveMsgAndGetRLogMsg(detected);
    // console.log("saveMsgAndGetRLogMsg.rLogMsg=",rLogMsg);
    await SEND_SERVICE.sendMsgToNodes(rLogMsg, 1 + config.secondaries.length, 1, 1, res);
}

module.exports = {
    processMessage
}