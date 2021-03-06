var express = require('express');
const fs = require("fs");
const axios = require("axios");
const moment = require('moment');
var router = express.Router();
const asyncModule = require("async");
const config = require('../config');
const {RESPONSE_MESSAGES} = require('../constants');
const UTILS = require('../services/utils');
const STATE_SERVICE = require('../services/state.service');
const STORAGE_SERVICE = require('../services/master-storage.service');
const PROCESS_SERVICE = require('../services/process.service');
const {RETRY} = require('../config');

router.post('/download-and-parse-file', async (req, res, next) => {
    let body_example = {
        "fileHash": "xxxxx",
        "fileUrl": "github.xxxxx",
        "project": "github.xxxx",
        "language": "java"
    };

    let body = req.body;
    // console.log("/parser/download-and-parse-file received body=", body);

    let { fileHash, fileUrl, project, language } = body;

    try {
        if (!fileHash || !fileUrl || !project || !language) {
            responseBody = { ...body_example };
            console.log("/parser/download-and-parse-file missing one of the required properties. Returning Error 400");
            return res.status(400).send(responseBody);
        }
        const isFileAlreadyProcessed = await UTILS.isFileAlreadyProcessed(fileHash);
        if(!1 && isFileAlreadyProcessed) {
            UTILS.sendResponse(res, 200, RESPONSE_MESSAGES.ALREADY_PROCESSED)
        } else {
            UTILS.sendResponse(res, 200, RESPONSE_MESSAGES.OK);
            await PROCESS_SERVICE.processFile(fileHash, fileUrl, project, language, res);
        }
        return res.status(200).send({msg: 'OK'});
    }
    catch (err) {
        console.log("/parser/download-and-parse-file: Error - ", err);
        next(err);
    }
});

router.get('/get-all-collected-keys', async (req, res, next) => {
    try {
        let data = await STORAGE_SERVICE.getAllMsg();
        console.log("/parser/get-all-detected-keys returning ", data);
        let responseBody = {data:data};
        return res.status(200).send(responseBody);
    }
    catch (err) {
        console.log("/master/get-all-messages: Error - ", err);
        next(err);
    }
});


router.post('/clear-db', async (req, res, next) => {
    try {
        console.log("/master/clear-db was invoked");
        let responseBody = { SUCCESS: STORAGE_SERVICE.clearDb() };
        return res.status(200).send(responseBody);
    }
    catch (err) {
        console.log("/master/clear-db: Error - ", err);
        next(err);
    }
});

module.exports = router;
