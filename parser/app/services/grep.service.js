const fs = require("fs");
const config = require('../config');
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const UTILS = require('../services/utils');
var Mutex = require('async-mutex').Mutex;
let mutexOUT_LOCK = new Mutex();
let mutexes = {};

/*
    let detected = {
        uuid: uuidv4(),
        detectedAt: UTILS.KievTimeNow(),
        fileHash: fileHash,
        project: project,
        fileUrl: fileUrl,
        language: language,
        service: 'hardcoded:_aws',
        found: 'hardcoded:_JHUGFHFH',
    }
 */

function grep({str, fileHash, fileUrl, project, language}){
    let detected = [{
        uuid: uuidv4(),
        detectedAt: UTILS.KievTimeNow(),
        fileHash: fileHash,
        project: project,
        fileUrl: fileUrl,
        language: language,
        str: str.slice(0, 40),
        service: 'hardcoded:_aws',
        found: 'hardcoded:_JHUGFHFH',
    }];
    return detected;
}

function lookForHello(str) {
    return [];
}

function lookForAwsKeys(str) {
    return [];
}

function lookForTwitterKeys(str) {
    return [];
}


module.exports = {
    grep
}