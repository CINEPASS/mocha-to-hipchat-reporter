const tv4 = require('tv4')
const configSchema = require('./config-schema')

module.exports.validateConfig = function (config) {
  if (!tv4.validate(config, configSchema)) {
    console.error('Config validation failed: %s at %s', tv4.error.message, tv4.error.dataPath)
    throw tv4.error
  }
}
