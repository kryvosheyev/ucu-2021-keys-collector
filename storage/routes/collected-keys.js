const express = require('express');
const router = express.Router();

const UTILS = require("../services/utils");
const STORAGE_SERVICE = require("../services/storage.service");
const COLLECTED_KEYS_SERVICE = require("../services/collected-keys.service");
const { HTTP_CODE } = require("../constants");


router.post('/create', async (req, res, next) => {
  try {
    let { data } = req.body;
    let { keys, value } = data;
    await STORAGE_SERVICE.createRecord(keys, value);
    const current = await STORAGE_SERVICE.getRecord(keys);
    const resp = {
      keys: current.keys,
      value: current.value
    }
    res.send(resp).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/collected-keys/create #ERROR: `, err);
    next(err);
  }
});


router.get('/record/:id/get', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      console.log("/record/:id/get #BODY: ", req.body);
      throw UTILS.createError("Missing query path parameter", HTTP_CODE.BAD_REQUEST)
    }
    let { data } = req.body;
    let { keys } = data;
    const current = await STORAGE_SERVICE.getRecord(keys);
    if(current){
      const resp = {
        keys: current.keys,
        value: current.value
      }
      res.send(resp).status(HTTP_CODE.OK);
    } else {
      res.send(current).status(HTTP_CODE.OK);
    }
  } catch (err) {
    console.log(`/record/:id/get #ERROR: `, err);
    next(err);
  }
});

router.get('/record/get-all', async (req, res, next) => {
  try {
    let { data } = req.body;
      let { keys, value } = data;
      const response = await STORAGE_SERVICE.getAllRecords(keys, value);
      res.send(response).status(HTTP_CODE.OK);
  } catch (err) {
    console.log(`/record/get-all #ERROR: `, err);
    next(err);
  }
});


module.exports = router;
