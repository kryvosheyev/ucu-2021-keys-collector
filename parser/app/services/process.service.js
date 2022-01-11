const fs = require("fs");
const config = require('../config');
const {RESPONSE_MESSAGES} = require('../constants');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

// const { delay, map, tap, filter } = require('rxjs/operators');
const split = require('split');

require("any-observable/register")('rxjs');
const streamToObservable = require('stream-to-observable');

const UTILS = require('../services/utils');
const STATE_SERVICE = require('../services/state.service');
const STORAGE_SERVICE = require('../services/master-storage.service');
const SEND_SERVICE = require('../services/send.service');
const HTTP_QUEUE = require('../services/http-queue');



async function processFile(fileHash, fileUrl, project, language, res) {
    console.log({fileHash, fileUrl, project, language});
    HTTP_QUEUE.addToQueue({fileHash, fileUrl, project, language});
}



module.exports = {
    processFile
}