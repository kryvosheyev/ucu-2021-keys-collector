const _ = require("lodash");
const config = require('../config');
const { Subject, BehaviorSubject } = require('rxjs');
const { delay, map, tap, filter, mergeMap, withLatestFrom, flatMap } = require('rxjs/operators');
const STORAGE_SERVICE = require('../services/master-storage.service');
const SEND_SERVICE = require('../services/send.service');

require("any-observable/register")('rxjs');
const streamToObservable = require('stream-to-observable');

const split = require('split');

const UTILS = require('../services/utils');
const GREP_SERVICE = require('../services/grep.service');

let init = {
    "fileHash": "03e400834c0dde37b9262539f5944a4034bb78b6",
    "project": "https://github.com/babylonhealth/terraform-provider-aws-babylon",
    "fileUrl": "https://github.com/babylonhealth/terraform-provider-aws-babylon/blob/3376dfe46ff66886d83a5ba7d234c35bc2967eed/aws/resource_aws_iam_access_key_test.go",
    "language": "go"
};
const QUEUE = new BehaviorSubject();


function addToQueue(fileObj) {
    QUEUE.next(fileObj);
}

function initQueue(){
    return QUEUE
        .pipe(
            mergeMap(fileObj => UTILS.sendGetHTTPAsStream(fileObj.fileUrl), null, 1),
            map((x) => {
                streamToObservable(x.data)
                    .pipe(
                        map((chunk) => chunk.toString()),
                        map((str) => GREP_SERVICE.grep({str: str, ...QUEUE.getValue()}))
                    )
                    .forEach(detectedArr => {
                        console.log(detectedArr);
                        sendToSecondaries(detectedArr).then();
                    })
            }),
        )
}

async function sendToSecondaries(detectedArr){
    for(let detected of detectedArr){
        let rLogMsg = await STORAGE_SERVICE.saveMsgAndGetRLogMsg(detected);
        await SEND_SERVICE.sendMsgToNodes(rLogMsg, 1 + config.secondaries.length, 1, 1, {});
    }
}

module.exports = {
    addToQueue,
    initQueue
}

