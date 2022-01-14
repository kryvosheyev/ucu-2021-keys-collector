const express = require('express');
const router = express.Router();
const { Subject, map, filter } = require('rxjs');

const UTILS = require("../services/utils");
const { HTTP_CODE } = require("../constants");
const STREAMER_SERVICE  = require('../services/streamer.service');


router.post('/send-collected-keys', async (req, res, next) => {
  let bodyExample = {
    "keys":[
      {
        "uuid": "1-uuidv4()",
        "detectedAt": "UTILS.KievTimeNow()",
        "fileHash": "fileHash",
        "project": "project",
        "fileUrl": "fileUrl",
        "language": "language",
        "service": "aws",
        "found": {
          "API": "JHUGFHFH",
          "SECRET": "secret"
        }
      },
      {
        "uuid": "2-uuidv4()",
        "detectedAt": "UTILS.KievTimeNow()",
        "fileHash": "fileHash",
        "project": "project",
        "fileUrl": "fileUrl",
        "language": "language",
        "service": "twitter",
        "found": {
          "API": "JHUGFHFH",
          "SECRET": "secret"
        }
      }
    ]
  }

  try {
    // console.log("/streamer/send-collected-keys body=", req.body);
    let { keys } = req.body;
    const resp = {"added ": keys};
    res.send(resp).status(HTTP_CODE.OK);

    STREAMER_SERVICE.processData(keys);

  } catch (err) {
    console.log(`/streamer/send-collected-keys #ERROR: `, err);
    next(err);
  }
});

module.exports = router;
