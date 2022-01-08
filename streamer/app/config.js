const config_env = {
  default: {
  },
  development: {
  },
  production: {
  },
};

const config = process.env.NODE_ENV ? config_env[process.env.NODE_ENV] : config_env.default;
module.exports = config;
