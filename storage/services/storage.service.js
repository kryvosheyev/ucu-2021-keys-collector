const { v4: uuidv4 } = require('uuid');

const Entities = require('../models/entities.model');

const resetDatabase = async (keys) => {
  try {
    let deleteRes = await Entities.deleteMany({ "keys.env": keys.env }).exec();
    console.log("deleteRes - ", deleteRes);
  } catch (err) {
    console.log(err);
  }
}

const deleteAllRecords = async (keys, value) => {
  try {
    let deleteRes = await Entities.deleteAllByKeysAndValuesQuery(keys, value);
    console.log("deleteAllRecords deleteRes - ", deleteRes);
  } catch (err) {
    console.log(err);
  }
}

const createRecord = async (keys, value) => {
  return await Entities.createRecord(keys, value);
}

const updateRecord = async (keys, value) => {
  return await Entities.createRecord(keys, value);
}

const getRecord = async (keys) => {
  return await Entities.findRecordByKeyHash(keys);
}

const getAllRecords = async (keys, value) => {
  return await Entities.findAllByKeysAndValuesQuery(keys, value);
}

module.exports = {
  resetDatabase,
  deleteAllRecords,
  createRecord,
  updateRecord,
  getRecord,
  getAllRecords
}
