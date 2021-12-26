const config = require("../../config");

module.exports = (req, res, next) => {
  let body = req.body;
  console.log('BODY before middleware', body)
  if (!body.data) {
    body.data = {};
  }
  if (body.data && !body.data.keys) {
    body.data.keys = {};
    // body.data.keys = {
    //   env: config.ENV
    // }
  }
  // if (body.data && body.data.keys && !body.data.keys.env) {
  //   body.data.keys.env = config.ENV;
  // }
  // body.data.keys.project = config.PROJECT;
  if(!body.data.hasOwnProperty('value')) {
    body.data.value = {};
  }
  next();
}
