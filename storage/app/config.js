const config_env = {
  default: {
    DATABASE_CONNECTION: 'mongodb://mongo_storage_1:27017/keys_collector',
    ENV: "TEST"
  },
  development: {
    DATABASE_CONNECTION: 'mongodb://mongo_storage_1:27017/keys_collector',
    ENV: "DEV"
  },
  production: {
    DATABASE_CONNECTION: 'mongodb://mongo_storage_1:27017/keys_collector',
    ENV: "PROD"
  },
};

const config = process.env.NODE_ENV ? config_env[process.env.NODE_ENV] : config_env.default;
module.exports = config;
