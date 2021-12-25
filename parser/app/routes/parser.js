var express = require('express');
const fs = require("fs");
const axios = require("axios");
const moment = require('moment');
var router = express.Router();
const asyncModule = require("async");
const config = require('../config');
const UTILS = require('../services/utils');
const STATE_SERVICE = require('../services/state.service');
const STORAGE_SERVICE = require('../services/master-storage.service');
const PROCESS_SERVICE = require('../services/process.service');
const {RETRY} = require('../config');




router.post('/download-and-parse-file', async (req, res, next) => {
    let body_example = {
        fileHash: 'xxxxx',
        fileUrl: 'github.xxxxx',
        project: 'github.xxxx',
        language: 'java'
    };

    let body = req.body;
    console.log("/master/add-message received body=", body);

    let { fileHash, fileUrl, project, language } = body;

    try {
        if (!fileHash || !fileUrl || !project || !language) {
            responseBody = { ...body_example };
            console.log("/master/add-message missing one of the required properties. Returning Error 400");
            return res.status(400).send(responseBody);
        }

        await PROCESS_SERVICE.processMessage(fileHash, fileUrl, project, language, res);
    }
    catch (err) {
        console.log("/master/add-message: Error - ", err);
        next(err);
    }

});

router.get('/get-all-detected-keys', async (req, res, next) => {
    try {
        let data = await STORAGE_SERVICE.getAllMsg();
        console.log("/master/get-all-messages returning ", data);
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
