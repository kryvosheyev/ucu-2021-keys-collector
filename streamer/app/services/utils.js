const fs = require("fs");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');

const { HTTP_CODE } = require("../constants");
const config = require('../config');

exports.createMD5Hash = (str) => {
  const hash = crypto.createHash("md5").update(str);
  const hashStr = hash.digest('hex');
  // console.log("createMD5Hash - ", hashStr);
  return hashStr;
}

exports.isObject = (item) => {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}



/**
 *
 * @param {string} str string to check
 * @return {boolean} returns boolean value
 */
exports.isEmptyString = (str) => {
  return (!str || typeof str !== "string" || str.length === 0);
}
/**
 *
 * @param {string} msg - Error message text
 * @param {number} httpStatus - HTTP status code
 * @param {Object }[errorObj] - original error object if exists
 * @return {Error} - returns new Error object
 */
exports.createError = (msg, httpStatus, errorObj) => {
  if (this.isEmptyString(msg)) {
    // AXIOS error
    if (errorObj && errorObj.response) {
      msg = errorObj.response.data.message;
    } else if (errorObj && errorObj.message) {
      msg = errorObj.message;
    } else {
      msg = 'Unknown message';
    }
  }
  const error = new Error(msg);
  if (errorObj && errorObj.stack) {
    error.stack = errorObj.stack;
  }
  error.status = httpStatus || HTTP_CODE.INTERNAL_SERVER_ERROR;
  return error;
}

