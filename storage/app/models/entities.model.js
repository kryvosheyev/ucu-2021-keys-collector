const mongoose = require('mongoose');
const UTILS = require('../services/utils');
const Schema = mongoose.Schema;
const _ = require('lodash');

let EntitiesSchema = new Schema({
  key_hash: String,
  updateAt: { type: Date, default: Date.now },
  value: {},
  keys: {}
});

EntitiesSchema.methods = {};

// EntitiesSchema.statics = {
EntitiesSchema.statics.createRecord = (keys, value) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log("Call createRecord");
      keys = sortByKeys(keys);
      let keyHash = UTILS.createMD5Hash(JSON.stringify(keys));
      let record = await Entities.findOne({ key_hash: keyHash }).exec();
      if (!record) {
        let instance = new Entities({
          key_hash: keyHash,
          value,
          keys
        })
        await instance.save();
        //console.log("Entity record created");
        resolve(instance);
      } else {
        console.log("Entity record exists");
        record.updatedAt = Date.now();
        record.value = value;
        const updated = await record.save();
        console.log("Entity record updated");
        resolve(updated);
      }
    } catch (err) {
      reject(err);
    }
  })
}

EntitiesSchema.statics.findRecordByKeyHash = (keys) => {
  return new Promise(async (resolve, reject) => {
    try {
      keys = sortByKeys(keys);
      let keyHash = UTILS.createMD5Hash(JSON.stringify(keys));
      let record = await Entities.findOne({ key_hash: keyHash }).exec();
      if(record){
        let result = {};
        result.keys = record.keys;
        result.value = record.value;
        resolve(result);
      } else {
        resolve(record);
      }

    } catch (err) {
      reject(err);
    }
  })
}

EntitiesSchema.statics.findAllByKeysQuery = async (keys) => {
  return new Promise(async (resolve, reject) => {
    try {
      keys = sortByKeys(keys);
      let query = {};
      for (let key in keys) {
        // console.log('key:', key);
        // console.log('value:', keys[key]);
        query[`keys.${key}`] = keys[key];
      }
      const toObject = true;
      let records = await Entities.find(query,null,{lean:toObject}).exec();
      let results = [];
      for(let i=0; i<records.length; i++){
        results.push({keys:records[i].keys, value:records[i].value});
      }
      // console.log("findAllByKeysQuery result - ", result);
      resolve(results);
    } catch (err) {
      reject(err);
    }
  })
}

EntitiesSchema.statics.findAllByKeysAndValuesQuery = async (keys, values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      keys = sortByKeys(keys);
      for (let key in keys) {
        // console.log('key:', key);
        // console.log('value:', keys[key]);
        query[`keys.${key}`] = keys[key];
      }
      if (UTILS.isObject(values)) {
        values = sortByKeys(values);
        for (let value in values) {
          query[`value.${value}`] = values[value];
        }
      }
      const toObject = true;
      let records = await Entities.find(query, null,{lean:toObject}).exec();
      let result = [];
      for(let i=0; i<records.length; i++){
        result.push({keys:records[i].keys, value:records[i].value});
      }
      // console.log("findAllByKeysAndValuesQuery result - ", query, result);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  })
}

EntitiesSchema.statics.deleteAllByKeysAndValuesQuery = async (keys, values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};
      keys = sortByKeys(keys);
      for (let key in keys) {
        // console.log('key:', key);
        // console.log('value:', keys[key]);
        query[`keys.${key}`] = keys[key];
      }
      if (UTILS.isObject(values)) {
        values = sortByKeys(values);
        for (let value in values) {
          query[`value.${value}`] = values[value];
        }
      }
      let deleteRes = await Entities.deleteMany(query).exec();
      // console.log("deleteAllByKeysAndValuesQuery deleteRes - ", deleteRes);
      resolve(deleteRes);
    } catch (err) {
      reject(err);
    }
  })
}

const sortByKeys = (object) => {
  const keys = Object.keys(object)
  const sortedKeys = _.sortBy(keys)

  return _.fromPairs(
    _.map(sortedKeys, key => [key, object[key]])
  )
}

const Entities = module.exports = mongoose.model('Entities', EntitiesSchema);
