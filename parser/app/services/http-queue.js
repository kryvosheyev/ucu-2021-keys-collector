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
    "fileHash": "init-hash",
    "project": "https://github.com/kryvosheyev/ucu-2021-keys-collector",
    "fileUrl": "https://raw.githubusercontent.com/kryvosheyev/ucu-2021-keys-collector/main/parser/app/downloaded/emptyfile.txt",
    "language": "go"
};

//"https://github.com/babylonhealth/terraform-provider-aws-babylon/blob/3376dfe46ff66886d83a5ba7d234c35bc2967eed/aws/resource_aws_iam_access_key_test.go",
//"https://raw.githubusercontent.com/babylonhealth/terraform-provider-aws-babylon/3376dfe46ff66886d83a5ba7d234c35bc2967eed/aws/resource_aws_iam_access_key_test.go

const QUEUE = new BehaviorSubject(init);


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

