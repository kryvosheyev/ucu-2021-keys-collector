const express = require('express');
const router = express.Router();

const UTILS = require("../services/utils");
const STORAGE_SERVICE = require("../services/storage.service");
const PROCESSED_FILES_SERVICE = require("../services/processed-files.service");
const { HTTP_CODE } = require("../constants");


router.post('/upsert-and-respond-if-existed-before', async (req, res, next) => {
  try {
    let { fileHash, fileUrl, project, language } = req.body;

    let keys = { fileHash };
    let value = { fileUrl, project, language };

    const found = await PROCESSED_FILES_SERVICE.getProcessedFile(keys);
    await PROCESSED_FILES_SERVICE.createProcessedFile(keys, value);
    const current = await PROCESSED_FILES_SERVICE.getProcessedFile(keys);
    const resp = {
      keys: current.keys,
      value: current.value,
      existed: !!(found)
    }
    res.send(resp).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/processed-files/upsert-and-respond-if-existed-before #ERROR: `, err);
    next(err);
  }
});

router.get('/get-all', async (req, res, next) => {
  try {
    let found = await PROCESSED_FILES_SERVICE.getAllProcessedFiles({});
    found = found.map(e => {
      return {
        fileHash: e.keys.fileHash,
        fileUrl: e.value.fileUrl,
        project: e.value.project,
        language: e.value.language,
      }
    })
    res.send(found).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/processed-files/get-all #ERROR: `, err);
    next(err);
  }
});


module.exports = router;
