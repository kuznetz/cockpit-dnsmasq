const dev = require('./webpack.config.dev.js');
const prod = require('./webpack.config.prod.js');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const conf = isDevelopment? dev(): prod()
  console.log(isDevelopment, conf)
  return conf
}