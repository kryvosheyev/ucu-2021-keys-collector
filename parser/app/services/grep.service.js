const fs = require("fs");
const config = require('../config');
const _ = require("lodash");
const UTILS = require('../services/utils');
var Mutex = require('async-mutex').Mutex;
let mutexOUT_LOCK = new Mutex();
let mutexes = {};

function lookForAwsKeys(str) {
    return [];
}

function lookForTwitterKeys(str) {
    return [];
}



module.exports = {
    lookForAwsKeys,
    lookForTwitterKeys,
}