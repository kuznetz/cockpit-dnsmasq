const commonConfig = require("./webpack.config.prod.js")
const path = require('path');

module.exports = {
  ...commonConfig,
  mode: 'development',

  devServer: {
    static: path.join(__dirname, 'public'),
    compress: false,
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    client: {
      overlay: true,
    },    
    //open: true, // Open browser automatically
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'dnsmasq-api': path.join(__dirname, 'src/dnsmasq-api-mock.js'),
    },
  },

  devtool: 'eval-source-map'
};