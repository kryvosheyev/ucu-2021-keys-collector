const fs = require("fs");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');

const { HTTP_CODE } = require("../constants");
const config = require('../config');
const DRIVE_PRIVATE_KEY = fs.readFileSync(`./${config.SWAN_DRIVE_RSA_PRIVATE_KEY}`, 'utf-8');

exports.createMD5Hash = (str) => {
  const hash = crypto.createHash("md5").update(str);
  const hashStr = hash.digest('hex');
  // console.log("createMD5Hash - ", hashStr);
  return hashStr;
}

exports.validateKeysPresent = (keys, body, res, exampleBody) => {
  if (body.showExampleBody) {
    let responseBody = { ...exampleBody };
    res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
    return false;
  }
  const hint = `pass_this_parameter { "showExampleBody" : "1" }`;
  let responseBody = { msg: hint }
  if (!body.data || (keys.length && !body.data.keys)) {
    res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
    console.log('validateKeysPresent failed, !body.data.keys ');
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    const reqDataKeys = Object.keys(body.data.keys);
    if (!reqDataKeys.includes(keys[i])) {
      console.log('validateKeysPresent failed, one of the keys not found ');
      res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
      return false;
    }
  }
  return true;
}

exports.validateKeysAndValuePropertiesPresent = (keys, valueProperties, body, res, exampleBody) => {
  if (body.showExampleBody) {
    let responseBody = { ...exampleBody };
    res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
    return false;
  }
  const hint = `pass_this_parameter { "showExampleBody" : "1" }`;
  let responseBody = { msg: hint }
  if ((keys.length) && (!body.data || !body.data.keys)) {
    res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
    console.log('validateKeysAndValuePropertiesPresent failed, !body.data.keys ');
    return false;
  }

  if ((valueProperties && valueProperties.length) && (!body.data || !body.data.value || !this.isObject(body.data.value))) {
    res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
    console.log('validateKeysAndValuePropertiesPresent failed, !body.data.value ');
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    const reqDataKeys = Object.keys(body.data.keys);
    if (!reqDataKeys.includes(keys[i])) {
      console.log('validateKeysAndValuePropertiesPresent failed, one of the keys not found ');
      res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
      return false;
    }
  }
  for (let i = 0; i < valueProperties.length; i++) {
    const reqDataKeys = Object.keys(body.data.value);
    if (!reqDataKeys.includes(valueProperties[i])) {
      console.log('validateKeysAndValuePropertiesPresent failed, one of the value property not found ');
      res.send(responseBody).status(HTTP_CODE.BAD_REQUEST);
      return false;
    }
  }
  return true;
}

exports.isObject = (item) => {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

exports.encryptPassword = async (pass) => {
  return await bcrypt.hash(pass, 10);
}

exports.comparePassword = async (pass, passHash) => {
  return await bcrypt.compare(pass, passHash);
}

exports.signTokenToDrive = (nic) => {
  const payloadObj = {
    nic: nic
  };
  const signOptions = {
    expiresIn: "7d",  // 60 = 60s || "60" = "60ms" || "10h" || "10d"
    algorithm: 'RS256'
  }
  const signedJWT = jwt.sign(payloadObj, DRIVE_PRIVATE_KEY, signOptions);
  return signedJWT;
}

exports.generateAuthToken = (username, project, roles) => {
  return new Promise(async (resolve, reject) => {
    axios({
      method: "post",
      baseURL: config.SWAN_AUTH_ENDPOINTS.AUTH_URL,
      url: config.SWAN_AUTH_ENDPOINTS.GENERATE_TOKEN,
      data: {
        username,
        project,
        roles
      },
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => {
      console.log("/generateAuthToken: response - ", response.data);
      if (response && response.status === 200) {
        let responseData = response.data;
        resolve(responseData.token)
      }
    }).catch(err => {
      console.log("/generateAuthToken: errResponse - ", err.response.data);
      reject(err.response.data);
    })
  })
}

/**
 *
 * @param {number} length number that represents length of generated token
 * @param {boolean} [digits] If true includes digits in generated token
 * @param {boolean} [lowerCaseAlphabets] If true includes lower case alphabets in generated token
 * @param {boolean} [upperCaseAlphabets] If true includes upper case alphabets in generated token
 * @return {string} generated token
 */
exports.generateRandomToken = (length = 6, { digits = true, lowerCaseAlphabets = false, upperCaseAlphabets = false } = {}) => {
  let result = '';
  const digitsCharacters = "0123456789";
  const lowerCaseAlphabetsCharacters = "abcdefghijklmnopqrstuvwxyz";
  const upperCaseAlphabetsCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let characters = '';
  if (digits) {
    characters += digitsCharacters;
  }
  if (lowerCaseAlphabets) {
    characters += lowerCaseAlphabetsCharacters;
  }
  if (upperCaseAlphabets) {
    characters += upperCaseAlphabetsCharacters;
  }
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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

