const { v4: uuidv4 } = require("uuid");

const { DB_TABLES } = require("../constants");
const Entities = require("../models/entities.model");

const createCollectedKey = async (keys, value) => {
  keys.table = DB_TABLES.COLLECTED_KEYS;
  return await Entities.createRecord(keys, value)
};

const getCollectedKey = async (keys) => {
  keys.table = DB_TABLES.COLLECTED_KEYS;
  return await Entities.findRecordByKeyHash(keys)
};

const getAllCollectedKeys = async (keys, values) => {
  keys.table = DB_TABLES.COLLECTED_KEYS;
  return await Entities.findAllByKeysAndValuesQuery(keys, values);
};

module.exports = {
  createCollectedKey,
  getCollectedKey,
  getAllCollectedKeys
}
