const express = require('express');
const router = express.Router();

const UTILS = require("../services/utils");
const STORAGE_SERVICE = require("../services/storage.service");
const COLLECTED_KEYS_SERVICE = require("../services/collected-keys.service");
const { HTTP_CODE } = require("../constants");


router.post('/create', async (req, res, next) => {
  /*
  let detected = {
        "uuid": "uuidv4()",
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
    }
   */
  try {
    console.log("/collected-keys/create body=", req.body);
    let { keys } = req.body;
    for(k of keys) {
      let { uuid, detectedAt, fileHash, project, fileUrl, language, service, found } = k;
      const collKeys = { uuid };
      const collValue = { detectedAt, fileHash, project, fileUrl, language, service, found };
      await COLLECTED_KEYS_SERVICE.createCollectedKey(collKeys, collValue);
    }
    const resp = {"msg": `saved ${keys.length} keys`};
    res.send(resp).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/collected-keys/create #ERROR: `, err);
    next(err);
  }
});

router.get('/get-all', async (req, res, next) => {
  try {
    let found = await COLLECTED_KEYS_SERVICE.getAllCollectedKeys({}, {});
    found = found.map(e => {
      return {
        uuid: e.keys.uuid,
        detectedAt: e.value.detectedAt,
        fileHash: e.value.fileHash,
        project: e.value.project,
        fileUrl: e.value.fileUrl,
        language: e.value.language,
        service: e.value.service,
        found: e.value.found,
      }
    });
    res.send(found).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/collected-keys/get-all #ERROR: `, err);
    next(err);
  }
});


module.exports = router;
