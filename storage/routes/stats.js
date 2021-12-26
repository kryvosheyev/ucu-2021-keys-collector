const express = require('express');
const router = express.Router();
const _ = require("lodash");

const UTILS = require("../services/utils");
const STORAGE_SERVICE = require("../services/storage.service");
const COLLECTED_KEYS_SERVICE = require("../services/collected-keys.service");
const { HTTP_CODE } = require("../constants");


router.get('/get', async (req, res, next) => {
  try {
    console.log("/stats/get body=", req.body);
    let stats = {};

    const found = await COLLECTED_KEYS_SERVICE.getAllCollectedKeys({}, {});
    const data = found.map(e => {
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
    stats.countByLanguage = _.countBy(data, 'language');
    stats.countByService = _.countBy(data, 'service');

    res.send(stats).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/stats/get #ERROR: `, err);
    next(err);
  }
});


module.exports = router;
