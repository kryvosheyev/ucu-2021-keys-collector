const { v4: uuidv4 } = require("uuid");

const { DB_TABLES } = require("../constants");
const Entities = require("../models/entities.model");

const createProcessedFile = async (keys, value) => {
  keys.table = DB_TABLES.PROCESSED_FILES;
  return await Entities.createRecord(keys, value)
};

const getProcessedFile = async (keys) => {
  keys.table = DB_TABLES.PROCESSED_FILES;
  return await Entities.findRecordByKeyHash(keys)
};

const getAllProcessedFiles = async (keys, values) => {
  keys.table = DB_TABLES.PROCESSED_FILES;
  return await Entities.findAllByKeysAndValuesQuery(keys, values);
};

module.exports = {
  createProcessedFile,
  getProcessedFile,
  getAllProcessedFiles
}
